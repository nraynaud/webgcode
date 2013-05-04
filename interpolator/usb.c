#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "usbd_conf.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usbd_desc.h"
#include "usb_dcd_int.h"
#include "usbd_ioreq.h"


#define USBD_VID                     0x0483
#define USBD_PID                     0xFFFF

#define USBD_LANGID_STRING            0x409
#define USBD_MANUFACTURER_STRING      "STMicroelectronics"

#define USBD_PRODUCT_FS_STRING        "Nico CNC"
#define USBD_SERIALNUMBER_FS_STRING   "000000000DEV"

#define VENDOR_CLASS                  0xFF

#define INTERRUPT_PACKET_SIZE         8
#define INTERRUPT_ENDPOINT_NUM        1
#define INTERRUPT_ENDPOINT_DIR        EP_IN
#define INTERRUPT_ENDPOINT            (INTERRUPT_ENDPOINT_DIR|INTERRUPT_ENDPOINT_NUM)

#define BULK_PACKET_SIZE              64
#define BULK_ENDPOINT_NUM             1
#define BULK_ENDPOINT_DIR             EP_OUT
#define BULK_ENDPOINT                 (BULK_ENDPOINT_DIR|BULK_ENDPOINT_NUM)

typedef enum {
    EP_IN = 0b10000000U, EP_OUT = 0b00000000U
} EndpointDirection_t;

static USB_OTG_CORE_HANDLE USB_OTG_dev __attribute__((aligned (4)));

static const struct __attribute__((__packed__)) {
    uint8_t bLength, bDescriptorType;
    uint8_t bcdUSBL, bcdUSBH;
    uint8_t bDeviceClass, bDeviceSubClass, bDeviceProtocol, bMaxPacketSize;
    uint8_t idVendorL, idVendorH;
    uint8_t idProductL, idProductH;
    uint8_t bcdDeviceL, bcdDeviceH;
    uint8_t iManufacturer, iProduct, iSerialNumber;
    uint8_t bNumConfigurations;
} deviceDescriptor __attribute__((aligned (4))) = {
        .bLength = (uint8_t) sizeof(deviceDescriptor),
        .bDescriptorType = USB_DEVICE_DESCRIPTOR_TYPE,
        .bcdUSBL = 0x00,
        .bcdUSBH = 0x02,
        .bDeviceClass = 0x00,
        .bDeviceSubClass = 0x00,
        .bDeviceProtocol = 0x00,
        .bMaxPacketSize = USB_OTG_MAX_EP0_SIZE,
        .idVendorL = LOBYTE(USBD_VID),
        .idVendorH = HIBYTE(USBD_VID),
        .idProductL = LOBYTE(USBD_PID),
        .idProductH = HIBYTE(USBD_PID),
        .bcdDeviceL = 0x00,
        .bcdDeviceH = 0x02,
        .iManufacturer = USBD_IDX_MFC_STR,
        .iProduct = USBD_IDX_PRODUCT_STR,
        .iSerialNumber = USBD_IDX_SERIAL_STR,
        .bNumConfigurations = USBD_CFG_MAX_NUM};

static uint8_t *getDeviceDescriptor(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof(deviceDescriptor);
    return (uint8_t *) &deviceDescriptor;
}

static uint8_t USBD_LangIDDesc[USB_SIZ_STRING_LANGID] __attribute__((aligned (4))) = {
        USB_SIZ_STRING_LANGID,
        USB_DESC_TYPE_STRING,
        LOBYTE(USBD_LANGID_STRING),
        HIBYTE(USBD_LANGID_STRING),
};

static uint8_t *getLangIDDescriptor(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof(USBD_LangIDDesc);
    return USBD_LangIDDesc;
}

static uint8_t *getProductStr(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_PRODUCT_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

static uint8_t *getManufacturerStr(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_MANUFACTURER_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

static uint8_t *getSerialStr(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_SERIALNUMBER_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

static uint8_t *getConfigStr(uint8_t speed, uint16_t *length) {
    return 0;
}

static uint8_t *getInterfaceStr(uint8_t speed, uint16_t *length) {
    return 0;
}

#define BUFFER_SIZE     64
static uint8_t buffer[BUFFER_SIZE];


static uint8_t cncInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Open(pdev, INTERRUPT_ENDPOINT, INTERRUPT_PACKET_SIZE, USB_OTG_EP_INT);
    DCD_EP_Open(pdev, BULK_ENDPOINT, BULK_PACKET_SIZE, USB_OTG_EP_BULK);
    DCD_EP_PrepareRx(pdev, BULK_ENDPOINT, buffer, BUFFER_SIZE);
    STM_EVAL_LEDOn(LED4);
    return USBD_OK;
}

static uint8_t cncDeInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Flush(pdev, INTERRUPT_ENDPOINT);
    DCD_EP_Close(pdev, INTERRUPT_ENDPOINT);
    DCD_EP_Close(pdev, BULK_ENDPOINT);
    STM_EVAL_LEDOff(LED4);
    return USBD_OK;
}

static uint8_t cncSetup(void *pdev, USB_SETUP_REQ *req) {
    return USBD_OK;
}

static uint8_t cncDataIn(void *pdev, uint8_t epnum) {
    if (INTERRUPT_ENDPOINT_NUM == epnum)
        DCD_EP_Flush(pdev, INTERRUPT_ENDPOINT);
    return USBD_OK;
}

#define CIRCULAR_BUFFER_SIZE    200
static uint8_t circularBuffer[CIRCULAR_BUFFER_SIZE];
static volatile int32_t writeCount = 0;
static volatile int32_t readCount = 0;

extern void executeNextStep();

extern uint8_t running;

static uint8_t cncDataOut(void *pdev, uint8_t epnum) {
    uint32_t count = USBD_GetRxCount(pdev, epnum);
    if (count == 0 && !running)
        executeNextStep();
    for (int i = 0; i < count; i++) {
        if (writeCount - readCount >= CIRCULAR_BUFFER_SIZE && !running)
            executeNextStep();
        while (writeCount - readCount >= CIRCULAR_BUFFER_SIZE)
            STM_EVAL_LEDOn(LED3);
        STM_EVAL_LEDOff(LED3);
        circularBuffer[(writeCount) % CIRCULAR_BUFFER_SIZE] = buffer[i % BUFFER_SIZE];
        writeCount++;
    }
    DCD_EP_PrepareRx(pdev, BULK_ENDPOINT, buffer, BUFFER_SIZE);
    return USBD_OK;
}

void resetBuffer() {
    readCount = 0;
    writeCount = 0;
}

uint8_t readBuffer() {
    if (writeCount - readCount <= 0) {
        STM_EVAL_LEDOn(LED5);
        return 0;
    }
    STM_EVAL_LEDOff(LED5);
    uint8_t val = circularBuffer[(readCount) % CIRCULAR_BUFFER_SIZE];
    readCount++;
    return val;
}

typedef struct __attribute__((packed)) {
    // http://www.beyondlogic.org/usbnutshell/usb5.shtml#EndpointDescriptors
    uint8_t bLength, bDescriptorType, bEndpointAddress, bmAttributes, wMaxPacketSizeL, wMaxPacketSizeH, bInterval;
} EndPoint_t;

static const struct __attribute__((packed)) {
    uint8_t bLength, bDescriptorType, wTotalLengthL, wTotalLengthH, bNumInterfaces, bConfigurationValue, iConfiguration,
            bmAttributes, bMaxPower;
    struct __attribute__((packed)) {
        uint8_t bLength, bDescriptorType, bInterfaceNumber, bAlternateSetting, bNumEndpoints, bInterfaceClass,
                bInterfaceSubClass, bInterfaceProtocol, iInterface;
        EndPoint_t firstEndpoint;
        EndPoint_t secondEndpoint;
    } interface;
} configurationDescriptor __attribute__((aligned (4))) = {
        .bLength = 9,
        .bDescriptorType = USB_CONFIGURATION_DESCRIPTOR_TYPE,
        .wTotalLengthL =  LOBYTE(sizeof(configurationDescriptor)),
        .wTotalLengthH = HIBYTE(sizeof(configurationDescriptor)),
        .bNumInterfaces = 1,
        .bConfigurationValue = 1,
        .iConfiguration = 0,
        .bmAttributes = 0xE0,
        .bMaxPower = 0x32,
        .interface = {
                .bLength = 9,
                .bDescriptorType = USB_INTERFACE_DESCRIPTOR_TYPE,
                .bInterfaceNumber = 0,
                .bAlternateSetting = 0,
                .bNumEndpoints = 2,
                .bInterfaceClass = VENDOR_CLASS,
                .bInterfaceSubClass = 0x01,
                .bInterfaceProtocol = 0x00,
                .iInterface = 0,
                .firstEndpoint = {
                        .bLength = 7,
                        .bDescriptorType = USB_ENDPOINT_DESCRIPTOR_TYPE,
                        .bEndpointAddress = INTERRUPT_ENDPOINT,
                        .bmAttributes = 0b00000011,
                        .wMaxPacketSizeL = LOBYTE(INTERRUPT_PACKET_SIZE),
                        .wMaxPacketSizeH = HIBYTE(INTERRUPT_PACKET_SIZE),
                        .bInterval = 1},
                .secondEndpoint = {
                        .bLength = 7,
                        .bDescriptorType = USB_ENDPOINT_DESCRIPTOR_TYPE,
                        .bEndpointAddress = BULK_ENDPOINT,
                        .bmAttributes = 0b00000010,
                        .wMaxPacketSizeL = LOBYTE(BULK_PACKET_SIZE),
                        .wMaxPacketSizeH = HIBYTE(BULK_PACKET_SIZE),
                        .bInterval = 0}
        }
};

static uint8_t *cncGetCfgDesc(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof (configurationDescriptor);
    return (uint8_t *) &configurationDescriptor;
}

USBD_Class_cb_TypeDef USBD_CNC_cb = {
        cncInit,
        cncDeInit,
        cncSetup,
        NULL, /*EP0_TxSent*/
        NULL, /*EP0_RxReady*/
        cncDataIn, /*DataIn*/
        cncDataOut, /*DataOut*/
        NULL, /*SOF */
        NULL,
        NULL,
        cncGetCfgDesc,
};

static void USBD_USR_DeviceReset(uint8_t speed) {
}

static void DoNothing(void) {
}

static USBD_Usr_cb_TypeDef USR_cb = {DoNothing, USBD_USR_DeviceReset, DoNothing, DoNothing, DoNothing, DoNothing, DoNothing,};
static USBD_DEVICE USR_desc = {getDeviceDescriptor, getLangIDDescriptor, getManufacturerStr, getProductStr, getSerialStr,
        getConfigStr, getInterfaceStr};

void initUSB() {
    USBD_Init(&USB_OTG_dev, USB_OTG_FS_CORE_ID, &USR_desc, &USBD_CNC_cb, &USR_cb);
    DCD_DevDisconnect(&USB_OTG_dev);
}

void sendInterrupt(uint8_t *buffer, uint32_t len) {
    if (USB_OTG_dev.dev.device_status == USB_OTG_CONFIGURED) {
        DCD_EP_Tx(&USB_OTG_dev, INTERRUPT_ENDPOINT, buffer, MIN(len, INTERRUPT_PACKET_SIZE));
    }
}

void OTG_FS_WKUP_IRQHandler(void) {
    if (USB_OTG_dev.cfg.low_power) {
        /* Reset SLEEPDEEP and SLEEPONEXIT bits */
        SCB->SCR &= (uint32_t) ~((uint32_t) (SCB_SCR_SLEEPDEEP_Msk | SCB_SCR_SLEEPONEXIT_Msk));

        /* After wake-up from sleep mode, reconfigure the system clock */
        SystemInit();
        USB_OTG_UngateClock(&USB_OTG_dev);
    }
    EXTI_ClearITPendingBit(EXTI_Line18);
}

__attribute__ ((used)) void OTG_FS_IRQHandler(void) {
    USBD_OTG_ISR_Handler(&USB_OTG_dev);
}