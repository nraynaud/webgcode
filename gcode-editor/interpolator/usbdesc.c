#include "stm32f4xx_conf.h"
#include "arm_math.h"
#include "usbd_conf.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usbd_desc.h"
#include "cnc.h"

#define USBD_VID                      0x0483
#define USBD_PID                      0xFFFF
#define USBD_LANGID_STRING            0x409
#define USBD_MANUFACTURER_STRING      "STMicroelectronics"
#define USBD_PRODUCT_FS_STRING        "Nico CNC"
#define USBD_SERIALNUMBER_FS_STRING   "000000000DEV"
#define VENDOR_CLASS                  0xFF

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
        .bNumConfigurations = USBD_CFG_MAX_NUM
};

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
        EndPoint_t firstEndpoint, secondEndpoint;
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
                        .bmAttributes = (uint8_t) 0b00000011,
                        .wMaxPacketSizeL = LOBYTE(INTERRUPT_PACKET_SIZE),
                        .wMaxPacketSizeH = HIBYTE(INTERRUPT_PACKET_SIZE),
                        .bInterval = 100},
                .secondEndpoint = {
                        .bLength = 7,
                        .bDescriptorType = USB_ENDPOINT_DESCRIPTOR_TYPE,
                        .bEndpointAddress = BULK_ENDPOINT,
                        .bmAttributes = (uint8_t) 0b00000010,
                        .wMaxPacketSizeL = LOBYTE(BULK_PACKET_SIZE),
                        .wMaxPacketSizeH = HIBYTE(BULK_PACKET_SIZE),
                        .bInterval = 0}
        }
};

uint8_t *cncGetCfgDesc(uint8_t speed, uint16_t *length) {
    *length = (uint16_t) sizeof(configurationDescriptor);
    return (uint8_t *) &configurationDescriptor;
}

const USBD_DEVICE USR_desc = {
        .GetDeviceDescriptor = getDeviceDescriptor,
        .GetLangIDStrDescriptor = getLangIDDescriptor,
        .GetManufacturerStrDescriptor = getManufacturerStr,
        .GetProductStrDescriptor = getProductStr,
        .GetSerialStrDescriptor = getSerialStr,
        .GetConfigurationStrDescriptor = getConfigStr,
        .GetInterfaceStrDescriptor = getInterfaceStr};