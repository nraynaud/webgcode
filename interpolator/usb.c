#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usb_dcd_int.h"
#include "usbd_ioreq.h"
#include "cnc.h"


static inline void dmb(void) {
    __asm__ __volatile__ ("dmb" : : : "memory");
}

static USB_OTG_CORE_HANDLE usbDevice __attribute__((aligned (4)));

#define BUFFER_SIZE     64U
static uint8_t buffer[BUFFER_SIZE];

static uint8_t cncInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Open(pdev, INTERRUPT_ENDPOINT, INTERRUPT_PACKET_SIZE, USB_OTG_EP_INT);
    DCD_EP_Open(pdev, BULK_ENDPOINT, BULK_PACKET_SIZE, USB_OTG_EP_BULK);
    DCD_EP_PrepareRx(pdev, BULK_ENDPOINT, buffer, BUFFER_SIZE);
    STM_EVAL_LEDOn(LED4);
    return USBD_OK;
}

static uint8_t cncDeInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Close(pdev, INTERRUPT_ENDPOINT);
    DCD_EP_Close(pdev, BULK_ENDPOINT);
    STM_EVAL_LEDOff(LED4);
    return USBD_OK;
}

enum {
    REQUEST_POSITION = 0,
    REQUEST_PARAMETERS = 1,
    REQUEST_STATE = 2,
    REQUEST_TOGGLE_MANUAL_STATE = 3,
    REQUEST_DEFINE_AXIS_POSITION = 4
};

typedef enum {
    OUT = 0,
    IN = 1
} ctrl_req_direction_t;

typedef enum {
    STANDARD = 0,
    CLASS = 1,
    VENDOR = 2,
} ctrl_req_type_t;

typedef enum {
    DEVICE = 0,
    INTERFACE = 1,
    ENDPOINT = 2,
    OTHER = 3
} ctrl_req_recipient_t;

typedef struct {
    ctrl_req_recipient_t recipient: 5;
    ctrl_req_type_t type: 2;
    ctrl_req_direction_t direction : 1;
} bmRequest_t;

void sendEvent(uint32_t event) {
    cncMemory.lastEvent[0] = event;
    DCD_EP_Tx(&usbDevice, INTERRUPT_ENDPOINT, (uint8_t *) cncMemory.lastEvent, sizeof(cncMemory.lastEvent));
}

#define CIRCULAR_BUFFER_SIZE    16384U
static struct {
    uint8_t buffer[CIRCULAR_BUFFER_SIZE];
    uint16_t writeCount;
    uint16_t readCount;
    int signaled;
    int flushing;
    uint32_t programLength;
    uint32_t programID;
} circularBuffer = {
        .writeCount = 0,
        .readCount = 0,
        .signaled = 0,
        .flushing = 0,
        .programLength = 0,
        .programID = 0
};

typedef enum {
    CONTROL_READY = 0,
    CONTROL_WAITING_AXES_VALUES = 1
} control_endpoint_mode_t;

static struct {
    control_endpoint_mode_t state;
    int32_t positionBuffer[3];
    uint8_t axesMasks;
    USB_SETUP_REQ request;
} controlEndpointState = {
        .state = CONTROL_READY,
        .positionBuffer = {0, 0, 0},
        .axesMasks = 0
};

static uint8_t setPositionFromUSB(void *pdev, USB_SETUP_REQ *req, uint16_t axisMask, int32_t position[3]) {
    controlEndpointState.state = CONTROL_READY;
    if (cncMemory.state == MANUAL_CONTROL || cncMemory.state == READY) {
        if (axisMask & 0b001)
            cncMemory.position.x = position[0];
        if (axisMask & 0b010)
            cncMemory.position.y = position[1];
        if (axisMask & 0b100)
            cncMemory.position.z = position[2];
        return USBD_OK;
    } else {
        USBD_CtlError(pdev, req);
        return USBD_FAIL;
    }
}

static uint8_t cncSetup(void *pdev, USB_SETUP_REQ *req) {
    bmRequest_t parsed =
            ((union {
                uint8_t n;
                bmRequest_t s;
            }) {.n=req->bmRequest}).s;
    switch (parsed.type) {
        case VENDOR :
            switch (parsed.direction) {
                case IN:
                    switch (req->bRequest) {
                        case REQUEST_POSITION:
                            USBD_CtlSendData(pdev, (uint8_t *) &cncMemory.position, (uint16_t) sizeof(cncMemory.position));
                            return USBD_OK;
                        case REQUEST_PARAMETERS:
                            USBD_CtlSendData(pdev, (uint8_t *) &cncMemory.parameters, (uint16_t) sizeof(cncMemory.parameters));
                            return USBD_OK;
                        case REQUEST_STATE: {
                            //using a static, so that it doesn't get cleaned up before the driver reads it
                            static volatile uint32_t state[2];
                            state[0] = isEmergencyStopped() << 16 | cncMemory.state;
                            state[1] = 0;
                            if (cncMemory.state == RUNNING_PROGRAM || cncMemory.state == ABORTING_PROGRAM)
                                state[1] = circularBuffer.programID;
                            USBD_CtlSendData(pdev, (uint8_t *) &state, (uint16_t) sizeof(state));
                            return USBD_OK;
                        };
                        default:
                            USBD_CtlError(pdev, req);
                            break;
                    }
                    break;
                case OUT:
                    switch (req->bRequest) {
                        case REQUEST_TOGGLE_MANUAL_STATE:
                            if (toggleManualMode()) {
                                USBD_CtlSendStatus(pdev);
                                return USBD_OK;
                            } else {
                                USBD_CtlError(pdev, req);
                                return USBD_FAIL;
                            }
                        case REQUEST_DEFINE_AXIS_POSITION:
                            controlEndpointState.state = CONTROL_WAITING_AXES_VALUES;
                            controlEndpointState.axesMasks = (uint8_t) req->wValue;
                            controlEndpointState.request = *req;
                            USBD_CtlPrepareRx(pdev, (uint8_t *) controlEndpointState.positionBuffer, sizeof(controlEndpointState.positionBuffer));
                            USBD_CtlSendStatus(pdev);
                            return USBD_OK;
                        default:
                            USBD_CtlError(pdev, req);
                            return USBD_FAIL;
                    }
            }
            break;
        case STANDARD:
            if (req->wIndex == BULK_ENDPOINT && req->wValue == USB_FEATURE_EP_HALT) {
                //the stall/clear stall has been done by the lib.
                if (req->bRequest == USB_REQ_SET_FEATURE) {
                    circularBuffer.programLength = 0;
                    circularBuffer.flushing = 0;
                    circularBuffer.writeCount = 0;
                    circularBuffer.readCount = 0;
                    circularBuffer.signaled = 0;
                    cncMemory.state = ABORTING_PROGRAM;
                    DCD_EP_Flush(pdev, BULK_ENDPOINT_NUM);
                } else if (req->bRequest == USB_REQ_CLEAR_FEATURE) {
                    cncMemory.state = READY;
                    sendEvent(PROGRAM_END);
                    DCD_EP_Flush(pdev, BULK_ENDPOINT_NUM);
                    DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
                }
            }
            break;
        default:
            return USBD_OK;
    }
    return USBD_OK;
}

uint8_t cncReceiveControlData(void *pdev) {
    if (controlEndpointState.state == CONTROL_WAITING_AXES_VALUES)
        return setPositionFromUSB(pdev, &(controlEndpointState.request), controlEndpointState.axesMasks, controlEndpointState.positionBuffer);
    return USBD_FAIL;
}

uint16_t fillLevel() {
    return (uint16_t) (circularBuffer.writeCount - circularBuffer.readCount);
}


int32_t readBufferArray2(uint32_t count, uint8_t *array);

void startProgram() {
    uint8_t array[8];
    uint16_t savedState = cncMemory.state;
    cncMemory.state = RUNNING_PROGRAM;
    if (readBufferArray2(sizeof(array) / sizeof(*array), array)) {
        sendEvent(PROGRAM_START);
        circularBuffer.programLength = array[3] << 24 | array[2] << 16 | array[1] << 8 | array[0];
        circularBuffer.programID = array[7] << 24 | array[6] << 16 | array[5] << 8 | array[4];
    } else
        cncMemory.state = savedState;
}

void flushBuffer() {
    dmb();
    if (!circularBuffer.flushing) {
        circularBuffer.flushing = 1;
        dmb();
        if (circularBuffer.signaled) {
            uint32_t count = USBD_GetRxCount(&usbDevice, BULK_ENDPOINT_NUM);
            if (fillLevel() < CIRCULAR_BUFFER_SIZE - count) {
                for (uint32_t i = 0; i < count; i++) {
                    circularBuffer.buffer[circularBuffer.writeCount % CIRCULAR_BUFFER_SIZE] = buffer[i];
                    circularBuffer.writeCount++;
                }
                circularBuffer.signaled = 0;
                DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
            }
        }
        if (cncMemory.state == READY)
            startProgram();
        if (cncMemory.state == RUNNING_PROGRAM && !cncMemory.running)
            executeNextStep();
        circularBuffer.flushing = 0;
        dmb();
    }
}

static uint8_t cncDataOut(void *pdev, uint8_t epnum) {
    if (cncMemory.state == MANUAL_CONTROL)
        toggleManualMode();
    if (cncMemory.state == READY || cncMemory.state == RUNNING_PROGRAM) {
        circularBuffer.signaled = 1;
        flushBuffer();
    }
    return USBD_OK;
}

int32_t readBufferArray2(uint32_t count, uint8_t *array) {
    flushBuffer();
    if (fillLevel() < count) {
        STM_EVAL_LEDOn(LED5);
        return 0;
    }
    STM_EVAL_LEDOff(LED5);
    for (int i = 0; i < count; i++) {
        array[i] = circularBuffer.buffer[circularBuffer.readCount % CIRCULAR_BUFFER_SIZE];
        circularBuffer.readCount++;
    }
    return 1;
}

int32_t readBufferArray(uint32_t count, uint8_t *array) {
    if (!readBufferArray2(count, array))
        return 0;
    circularBuffer.programLength -= count;
    return 1;
}

void checkProgramEnd() {
    if (circularBuffer.programLength == 0) {
        circularBuffer.programID = 0;
        cncMemory.state = READY;
        sendEvent(PROGRAM_END);
        if (fillLevel())
            startProgram();
    }
}

static void USBD_USR_DeviceReset(uint8_t speed) {
}

static void DoNothing(void) {
}

extern USBD_DEVICE USR_desc;

static struct {
    USBD_DEVICE *USR_desc;
    USBD_Class_cb_TypeDef USBD_CNC_cb;
    USBD_Usr_cb_TypeDef usrCB;
} USB_INTERFACE = {
        .USR_desc = &USR_desc,
        .USBD_CNC_cb = {
                .Init = cncInit,
                .DeInit = cncDeInit,
                .Setup = cncSetup,
                .EP0_TxSent = cncReceiveControlData,
                .DataOut = cncDataOut,
                .GetConfigDescriptor = cncGetCfgDesc},
        .usrCB = {
                .Init = DoNothing,
                .DeviceReset = USBD_USR_DeviceReset,
                .DeviceConfigured = DoNothing,
                .DeviceSuspended = DoNothing,
                .DeviceResumed = DoNothing,
                .DeviceConnected = DoNothing,
                .DeviceDisconnected = DoNothing}};

void initUSB() {
    USBD_Init(&usbDevice, USB_OTG_FS_CORE_ID, USB_INTERFACE.USR_desc, &USB_INTERFACE.USBD_CNC_cb, &USB_INTERFACE.usrCB);
    DCD_DevDisconnect(&usbDevice);
}

__attribute__ ((used)) void OTG_FS_WKUP_IRQHandler(void) {
    if (usbDevice.cfg.low_power) {
        SCB->SCR &= (uint32_t) ~((uint32_t) (SCB_SCR_SLEEPDEEP_Msk | SCB_SCR_SLEEPONEXIT_Msk));

        /* After wake-up from sleep mode, reconfigure the system clock */
        SystemInit();
        USB_OTG_UngateClock(&usbDevice);
    }
    EXTI_ClearITPendingBit(EXTI_Line18);
}

__attribute__ ((used)) void OTG_FS_IRQHandler(void) {
    USBD_OTG_ISR_Handler(&usbDevice);
}