#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "usbd_conf.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usbd_desc.h"
#include "usb_dcd_int.h"


#define USBD_VID                     0x0483
#define USBD_PID                     0xFFFF

#define USBD_LANGID_STRING            0x409
#define USBD_MANUFACTURER_STRING      "STMicroelectronics"

#define USBD_PRODUCT_FS_STRING        "Nico CNC"
#define USBD_SERIALNUMBER_FS_STRING   "000000000DEV"

#define USBD_CONFIGURATION_FS_STRING  "Config"
#define USBD_INTERFACE_FS_STRING      "Interface"

#define VENDOR_CLASS                0xFF
#define USB_PACKET_SIZE             1
#define ENDPOINT_ADDRESS 0b10000001U

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

uint8_t *USBD_USR_DeviceDescriptor(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof(deviceDescriptor);
    return (uint8_t *) &deviceDescriptor;
}

uint8_t USBD_LangIDDesc[USB_SIZ_STRING_LANGID] __attribute__((aligned (4))) = {
        USB_SIZ_STRING_LANGID,
        USB_DESC_TYPE_STRING,
        LOBYTE(USBD_LANGID_STRING),
        HIBYTE(USBD_LANGID_STRING),
};

uint8_t *USBD_USR_LangIDStrDescriptor(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof(USBD_LangIDDesc);
    return USBD_LangIDDesc;
}

uint8_t *USBD_USR_ProductStrDescriptor(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_PRODUCT_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

uint8_t *USBD_USR_ManufacturerStrDescriptor(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_MANUFACTURER_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

uint8_t *USBD_USR_SerialStrDescriptor(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_SERIALNUMBER_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

uint8_t *USBD_USR_ConfigStrDescriptor(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_CONFIGURATION_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}


uint8_t *USBD_USR_InterfaceStrDescriptor(uint8_t speed, uint16_t *length) {
    USBD_GetString((uint8_t *) USBD_INTERFACE_FS_STRING, USBD_StrDesc, length);
    return USBD_StrDesc;
}

static uint8_t USBD_HID_Init(void *pdev, uint8_t cfgidx) {
    DCD_EP_Open(pdev, ENDPOINT_ADDRESS, USB_PACKET_SIZE, USB_OTG_EP_INT);
    STM_EVAL_LEDOn(LED4);
    return USBD_OK;
}

static uint8_t USBD_HID_DeInit(void *pdev, uint8_t cfgidx) {
    DCD_EP_Close(pdev, ENDPOINT_ADDRESS);
    STM_EVAL_LEDOff(LED4);
    return USBD_OK;
}

static uint8_t USBD_HID_Setup(void *pdev, USB_SETUP_REQ *req) {
    return USBD_OK;
}

static uint8_t USBD_HID_DataIn(void *pdev, uint8_t epnum) {
    STM_EVAL_LEDToggle(LED3);
    DCD_EP_Flush(pdev, ENDPOINT_ADDRESS);
    return USBD_OK;
}

static const struct __attribute__((packed)) {
    uint8_t bLength, bDescriptorType, wTotalLengthL, wTotalLengthH, bNumInterfaces, bConfigurationValue, iConfiguration,
            bmAttributes, bMaxPower;

    struct __attribute__((packed)) {
        uint8_t bLength, bDescriptorType, bInterfaceNumber, bAlternateSetting, bNumEndpoints, bInterfaceClass,
                bInterfaceSubClass, bInterfaceProtocol, iInterface;
        struct __attribute__((packed)) {
            uint8_t bLength, bDescriptorType, bEndpointAddress, bmAttributes, wMaxPacketSizeL, wMaxPacketSizeH, bInterval;
        } firstEndpoint;
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
                .bNumEndpoints = 1,
                .bInterfaceClass = VENDOR_CLASS,
                .bInterfaceSubClass = 0x01,
                .bInterfaceProtocol = 0x00,
                .iInterface = 0,
                .firstEndpoint = {
                        .bLength = 7,
                        .bDescriptorType = USB_ENDPOINT_DESCRIPTOR_TYPE,
                        .bEndpointAddress = ENDPOINT_ADDRESS,
                        .bmAttributes = 0b00000011,
                        .wMaxPacketSizeL = LOBYTE(USB_PACKET_SIZE),
                        .wMaxPacketSizeH = HIBYTE(USB_PACKET_SIZE),
                        .bInterval = 10
                }
        }
};

static uint8_t *USBD_HID_GetCfgDesc(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof (configurationDescriptor);
    return (uint8_t *) &configurationDescriptor;
}

USBD_Class_cb_TypeDef USBD_CNC_cb = {
        USBD_HID_Init,
        USBD_HID_DeInit,
        USBD_HID_Setup,
        NULL, /*EP0_TxSent*/
        NULL, /*EP0_RxReady*/
        USBD_HID_DataIn, /*DataIn*/
        NULL, /*DataOut*/
        NULL, /*SOF */
        NULL,
        NULL,
        USBD_HID_GetCfgDesc,
};

void USBD_USR_Init(void) {
}

void USBD_USR_DeviceReset(uint8_t speed) {
}


void USBD_USR_DeviceConfigured(void) {
}

void USBD_USR_DeviceConnected(void) {
}

void USBD_USR_DeviceDisconnected(void) {
}

void USBD_USR_DeviceSuspended(void) {
}

void USBD_USR_DeviceResumed(void) {
}

USBD_Usr_cb_TypeDef USR_cb = {
        USBD_USR_Init,
        USBD_USR_DeviceReset,
        USBD_USR_DeviceConfigured,
        USBD_USR_DeviceSuspended,
        USBD_USR_DeviceResumed,
        USBD_USR_DeviceConnected,
        USBD_USR_DeviceDisconnected,
};
USBD_DEVICE USR_desc = {
        USBD_USR_DeviceDescriptor,
        USBD_USR_LangIDStrDescriptor,
        USBD_USR_ManufacturerStrDescriptor,
        USBD_USR_ProductStrDescriptor,
        USBD_USR_SerialStrDescriptor,
        USBD_USR_ConfigStrDescriptor,
        USBD_USR_InterfaceStrDescriptor,
};

void initUSB() {
    USBD_Init(&USB_OTG_dev, USB_OTG_FS_CORE_ID, &USR_desc, &USBD_CNC_cb, &USR_cb);
}

uint32_t sendInterrupt(uint8_t *buffer, uint32_t len) {
    return DCD_EP_Tx(&USB_OTG_dev, ENDPOINT_ADDRESS, buffer, MIN(len, USB_PACKET_SIZE));
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