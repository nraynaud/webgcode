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
    return USBD_OK;
}

static uint8_t cncDeInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Close(pdev, INTERRUPT_ENDPOINT);
    DCD_EP_Close(pdev, BULK_ENDPOINT);
    return USBD_OK;
}

// correspondence in CNCMachine.js
enum {
    REQUEST_POSITION = 0,
    REQUEST_PARAMETERS = 1,
    REQUEST_STATE = 2,
    REQUEST_TOGGLE_MANUAL_STATE = 3,
    REQUEST_DEFINE_AXIS_POSITION = 4,
    REQUEST_ABORT = 5,
    REQUEST_CLEAR_ABORT = 6,
    REQUEST_SET_SPI_OUTPUT = 7,
    REQUEST_RESUME_PROGRAM = 8,
    REQUEST_RESET_SPI_OUTPUT = 9,
    REQUEST_HOME = 10,
    REQUEST_WORK_OFFSET = 11
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
} __attribute__((packed)) bmRequest_t;

#define CIRCULAR_BUFFER_SIZE    16384U
static struct {
    uint8_t buffer[CIRCULAR_BUFFER_SIZE];
    uint16_t writeCount;
    uint16_t readCount;
    uint32_t signaled;
    uint32_t programLength;
    uint32_t programID;
} circularBuffer = {
        .writeCount = 0,
        .readCount = 0,
        .signaled = 0,
        .programLength = 0,
        .programID = 0
};

typedef enum {
    CONTROL_READY = 0,
    CONTROL_WAITING_AXES_VALUES = 1,
    CONTROL_WAITING_WORK_OFFSET = 2
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
            cncMemory.workOffset.x = position[0] - cncMemory.position.x;
        if (axisMask & 0b010)
            cncMemory.workOffset.y = position[1] - cncMemory.position.y;
        if (axisMask & 0b100)
            cncMemory.workOffset.z = position[2] - cncMemory.position.z;
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
                        case REQUEST_POSITION: {
                            static volatile position_t localPosition;
                            localPosition = cncMemory.position;
                            localPosition.x += cncMemory.workOffset.x;
                            localPosition.y += cncMemory.workOffset.y;
                            localPosition.z += cncMemory.workOffset.z;
                            USBD_CtlSendData(pdev, (uint8_t *) &localPosition, (uint16_t) sizeof(localPosition));
                            return USBD_OK;
                        }
                        case REQUEST_PARAMETERS:
                            USBD_CtlSendData(pdev, (uint8_t *) &cncMemory.parameters, (uint16_t) sizeof(cncMemory.parameters));
                            return USBD_OK;
                        case REQUEST_STATE: {
                            //using a static, so that it doesn't get cleaned up before the driver reads it
                            static volatile uint32_t state[3];
#pragma clang diagnostic push
#pragma ide diagnostic ignored "OCSimplifyInspection"
                            state[0] = !!cncMemory.zHomed << 20 | !!cncMemory.yHomed << 19 | !!cncMemory.xHomed << 18
                                    | isToolProbeTripped() << 17 | isEmergencyStopped() << 16
                                    | cncMemory.state;
                            state[1] = ((spi_output_serializer_t) {.s = cncMemory.spiOutput}).n << 16
                                    | ((spi_input_serializer_t) {.s = cncMemory.spiInput}).n;
#pragma clang diagnostic pop
                            state[2] = 0;
                            if (cncMemory.state == RUNNING_PROGRAM || cncMemory.state == ABORTING_PROGRAM)
                                state[2] = circularBuffer.programID;
                            USBD_CtlSendData(pdev, (uint8_t *) &state, (uint16_t) sizeof(state));
                            return USBD_OK;
                        }
                        case REQUEST_WORK_OFFSET: {
                            static volatile int32_t workOffset[3];
                            workOffset[0] = cncMemory.workOffset.x;
                            workOffset[1] = cncMemory.workOffset.y;
                            workOffset[2] = cncMemory.workOffset.z;
                            USBD_CtlSendData(pdev, (uint8_t *) &workOffset, (uint16_t) sizeof(workOffset));
                            return USBD_OK;
                        }
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
                        case REQUEST_WORK_OFFSET:
                            controlEndpointState.state = CONTROL_WAITING_WORK_OFFSET;
                            controlEndpointState.request = *req;
                            USBD_CtlPrepareRx(pdev, (uint8_t *) controlEndpointState.positionBuffer, sizeof(controlEndpointState.positionBuffer));
                            USBD_CtlSendStatus(pdev);
                            return USBD_OK;
                        case REQUEST_DEFINE_AXIS_POSITION:
                            controlEndpointState.state = CONTROL_WAITING_AXES_VALUES;
                            controlEndpointState.axesMasks = (uint8_t) req->wValue;
                            controlEndpointState.request = *req;
                            USBD_CtlPrepareRx(pdev, (uint8_t *) controlEndpointState.positionBuffer, sizeof(controlEndpointState.positionBuffer));
                            USBD_CtlSendStatus(pdev);
                            return USBD_OK;
                        case REQUEST_SET_SPI_OUTPUT:
                            cncMemory.spiOutput = ((spi_output_serializer_t) {.n = ((spi_output_serializer_t) {.s=cncMemory.spiOutput}).n
                                    | (uint8_t) req->wValue}).s;
                            return USBD_OK;
                        case REQUEST_RESET_SPI_OUTPUT:
                            cncMemory.spiOutput = ((spi_output_serializer_t) {.n = ((spi_output_serializer_t) {.s=cncMemory.spiOutput}).n
                                    & ~(uint8_t) req->wValue}).s;
                            return USBD_OK;
                        case REQUEST_HOME:
                            startHoming();
                            return USBD_OK;
                        case REQUEST_ABORT:
                            if (cncMemory.state == HOMING) {
                                cncMemory.stopHomingFlag = 1;
                                return USBD_OK;
                            }
                            cncMemory.state = ABORTING_PROGRAM;
                            //connect the endpoint to the /dev/null
                            DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
                            circularBuffer.programID = 0;
                            circularBuffer.programLength = 0;
                            circularBuffer.writeCount = 0;
                            circularBuffer.readCount = 0;
                            circularBuffer.signaled = 0;
                        case REQUEST_RESUME_PROGRAM:
                            cncMemory.state = RUNNING_PROGRAM;
                            return USBD_OK;
                        case REQUEST_CLEAR_ABORT:
                            DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
                            circularBuffer.programID = 0;
                            circularBuffer.programLength = 0;
                            circularBuffer.writeCount = 0;
                            circularBuffer.readCount = 0;
                            circularBuffer.signaled = 0;
                            cncMemory.state = READY;
                            return USBD_OK;
                        default:
                            USBD_CtlError(pdev, req);
                            return USBD_FAIL;
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
    if (controlEndpointState.state == CONTROL_WAITING_WORK_OFFSET) {
        controlEndpointState.state = CONTROL_READY;
        if (cncMemory.state == MANUAL_CONTROL || cncMemory.state == READY) {
            cncMemory.workOffset.x = controlEndpointState.positionBuffer[0];
            cncMemory.workOffset.y = controlEndpointState.positionBuffer[1];
            cncMemory.workOffset.z = controlEndpointState.positionBuffer[2];
            return USBD_OK;
        } else {
            USBD_CtlError(pdev, &(controlEndpointState.request));
            return USBD_FAIL;
        }
    }
    return USBD_FAIL;
}

uint16_t fillLevel() {
    return (uint16_t) (circularBuffer.writeCount - circularBuffer.readCount);
}

int32_t readBufferArray2(uint32_t count, uint8_t *array) {
    if (fillLevel() < count) {
        return 0;
    }
    for (int i = 0; i < count; i++) {
        array[i] = circularBuffer.buffer[circularBuffer.readCount % CIRCULAR_BUFFER_SIZE];
        circularBuffer.readCount++;
    }
    return 1;
}

#define PROGRAM_HEADER_LENGTH 8

//referenced from worker.js
typedef enum {
    PROGRAM_STEPS = 0,
    PROGRAM_START_SPINDLE = 1,
    PROGRAM_STOP_SPINDLE = 2,
    PROGRAM_START_SOCKET = 3,
    PROGRAM_STOP_SOCKET = 4
} program_type_t;

void tryToStartProgram() {
    uint8_t array[PROGRAM_HEADER_LENGTH];
    crBegin;
            if (readBufferArray2(PROGRAM_HEADER_LENGTH, array)) {
                program_type_t programType = (program_type_t) (array[0]);
                if (programType == PROGRAM_STEPS) {
                    cncMemory.state = RUNNING_PROGRAM;
                    circularBuffer.programLength = array[3] << 16 | array[2] << 8 | array[1];
                    circularBuffer.programID = array[7] << 24 | array[6] << 16 | array[5] << 8 | array[4];
                } else if (programType == PROGRAM_START_SPINDLE) {
                    cncMemory.spiOutput.run = 1;
                    crYieldVoidUntil(cncMemory.spiInput.drv);
                    crReturn();
                } else if (programType == PROGRAM_STOP_SPINDLE) {
                    cncMemory.spiOutput.run = 0;
                } else if (programType == PROGRAM_START_SOCKET) {
                    cncMemory.spiOutput.socket = 1;
                } else if (programType == PROGRAM_STOP_SOCKET) {
                    cncMemory.spiOutput.socket = 0;
                }
            }
    crFinish;
}

void checkProgramEnd() {
    if (circularBuffer.programLength == 0) {
        circularBuffer.programID = 0;
        cncMemory.state = READY;
    }
}

void copyUSBufferIfPossible() {
    static uint32_t lastSignal = 0;
    static uint32_t seenSignal = 0;
    static uint32_t count;
    crBegin;
            crYieldVoidUntil((seenSignal = circularBuffer.signaled) != lastSignal);
            count = USBD_GetRxCount(&usbDevice, BULK_ENDPOINT_NUM);
            crYieldVoidUntil(fillLevel() < CIRCULAR_BUFFER_SIZE - count);
            unsigned int bufferPosition = circularBuffer.writeCount % CIRCULAR_BUFFER_SIZE;
            int overflowingCount = bufferPosition + count - CIRCULAR_BUFFER_SIZE;
            if (overflowingCount < 0)
                overflowingCount = 0;
            unsigned int saturatedCount = count - overflowingCount;
            memcpy(circularBuffer.buffer + bufferPosition, buffer, saturatedCount);
            if (overflowingCount > 0)
                memcpy(circularBuffer.buffer, buffer + saturatedCount, overflowingCount);
            circularBuffer.writeCount += count;
            lastSignal = seenSignal;
            DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
    crFinish;
}

static uint8_t cncDataOut(void *pdev, uint8_t epnum) {
    if (cncMemory.state == ABORTING_PROGRAM)
        //just throw away the content
        DCD_EP_PrepareRx(&usbDevice, BULK_ENDPOINT, buffer, BUFFER_SIZE);
    else
        circularBuffer.signaled++;
    return USBD_OK;
}

int32_t readFromProgram(uint32_t count, uint8_t *array) {
    if (!readBufferArray2(count, array))
        return 0;
    circularBuffer.programLength -= count;
    return 1;
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
