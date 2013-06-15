#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usb_dcd_int.h"
#include "usbd_ioreq.h"
#include "cnc.h"

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
    REQUEST_ZERO_AXIS = 4
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
                        case REQUEST_STATE:
                            USBD_CtlSendData(pdev, (uint8_t *) &cncMemory.state, (uint16_t) sizeof(cncMemory.state));
                            return USBD_OK;
                        default:
                            USBD_CtlError(pdev, req);
                            break;
                    }
                    break;
                case OUT:
                    switch (req->bRequest) {
                        case REQUEST_TOGGLE_MANUAL_STATE:
                            switch (cncMemory.state) {
                                case READY:
                                    zeroJoystick();
                                    cncMemory.state = MANUAL_CONTROL;
                                    executeNextStep();
                                    sendEvent(ENTER_MANUAL_MODE);
                                    USBD_CtlSendStatus(pdev);
                                    return USBD_OK;
                                case MANUAL_CONTROL:
                                    cncMemory.state = READY;
                                    sendEvent(EXIT_MANUAL_MODE);
                                    USBD_CtlSendStatus(pdev);
                                    return USBD_OK;
                                default:
                                    USBD_CtlError(pdev, req);
                                    return USBD_FAIL;
                            }
                        case REQUEST_ZERO_AXIS:
                            if (cncMemory.state == MANUAL_CONTROL || cncMemory.state == READY) {
                                if (req->wValue & 0b001)
                                    cncMemory.position.x = 0;
                                if (req->wValue & 0b010)
                                    cncMemory.position.y = 0;
                                if (req->wValue & 0b100)
                                    cncMemory.position.z = 0;
                                USBD_CtlSendStatus(pdev);
                                return USBD_OK;
                            } else {
                                USBD_CtlError(pdev, req);
                                return USBD_FAIL;
                            }
                        default:
                            USBD_CtlError(pdev, req);
                            return USBD_FAIL;
                    }
            }
        default:
            break;
    }
    return USBD_OK;
}

void sendMovedEvent(position_t pos) {
    cncMemory.lastEvent[0] = MOVED;
    cncMemory.lastEvent[1] = pos.x;
    cncMemory.lastEvent[2] = pos.y;
    cncMemory.lastEvent[3] = pos.z;
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
} circularBuffer = {
        .writeCount = 0,
        .readCount = 0,
        .signaled = 0,
        .flushing = 0,
        .programLength = 0
};

uint16_t fillLevel() {
    return (uint16_t) (circularBuffer.writeCount - circularBuffer.readCount);
}

uint8_t readBuffer2();

void startProgram() {
    cncMemory.state = RUNNING_PROGRAM;
    sendEvent(PROGRAM_START);
    circularBuffer.programLength = 0;
    circularBuffer.programLength |= (uint32_t) readBuffer2();
    circularBuffer.programLength |= (uint32_t) readBuffer2() << 8;
    circularBuffer.programLength |= (uint32_t) readBuffer2() << 16;
    circularBuffer.programLength |= (uint32_t) readBuffer2() << 24;
}

void flushBuffer() {
    if (!circularBuffer.flushing) {
        circularBuffer.flushing = 1;
        if (circularBuffer.signaled) {
            uint32_t count = USBD_GetRxCount(&usbDevice, BULK_ENDPOINT_NUM);
            if (fillLevel() <= CIRCULAR_BUFFER_SIZE - count) {
                for (int i = 0; i < count; i++) {
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
    }
}

static uint8_t cncDataOut(void *pdev, uint8_t epnum) {
    if (cncMemory.state == READY || cncMemory.state == RUNNING_PROGRAM) {
        circularBuffer.signaled = 1;
        flushBuffer();
    } else
        DCD_EP_Stall(pdev, epnum);
    return USBD_OK;
}

uint8_t readBuffer2() {
    flushBuffer();
    if (fillLevel() == 0) {
        STM_EVAL_LEDOn(LED5);
        return 0;
    }
    STM_EVAL_LEDOff(LED5);
    uint8_t val = circularBuffer.buffer[circularBuffer.readCount % CIRCULAR_BUFFER_SIZE];
    circularBuffer.readCount++;
    return val;
}

uint8_t readBuffer() {
    if (circularBuffer.programLength == 0) {
        cncMemory.state = READY;
        sendEvent(PROGRAM_END);
        return 0;
    }
    uint8_t val = readBuffer2();
    circularBuffer.programLength--;
    return val;
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