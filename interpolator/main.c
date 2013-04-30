#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "usbd_conf.h"
#include "usb_core.h"
#include "usbd_core.h"
#include "usbd_req.h"
#include "usbd_desc.h"
#include "usb_dcd_int.h"

#define POINT_NUMBER (sizeof(points2) / sizeof(points2[0]))

static uint32_t points2[] = {20000, 1581, 655, 503, 424, 373, 337, 310, 289, 271, 257, 244, 233, 224, 215, 208, 201, 195, 189, 184, 179, 175, 171, 167, 163, 160, 157, 154, 151, 148, 146, 143, 141, 139, 137, 135, 133, 131, 129, 127, 126, 124, 123, 121, 120, 119, 117, 116, 115, 114, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 102, 101, 100, 99, 98, 98, 97, 96, 96, 95, 94, 93, 93, 92, 92, 91, 90, 90, 89, 89, 88, 88, 87, 87, 86, 85, 85, 85, 84, 84, 83, 83, 82, 82, 81, 81, 80, 80, 80, 79, 79, 78, 78, 78, 77, 77, 77, 76, 76, 76, 75, 75, 75, 74, 74, 74, 73, 73, 73, 72, 72, 72, 71, 71, 71, 71, 70, 70, 70, 69, 69, 69, 69, 68, 68, 68, 68, 67, 67, 67, 67, 66, 66, 66, 66, 66, 65, 65, 65, 65, 64, 64, 64, 64, 64, 63, 63, 63, 63, 63, 62, 62, 62, 62, 62, 61, 61, 61, 61, 61, 61, 60, 60, 60, 60, 60, 60, 59, 59, 59, 59, 59, 59, 58, 58, 58, 58, 58, 58, 57, 57, 57, 57, 57, 57, 57, 56, 56, 56, 56, 56, 56, 56, 55, 55, 55, 55, 55, 55, 55, 54, 54, 54, 54, 54, 54, 54, 54, 53, 53, 53, 53, 53, 53, 53, 53, 53, 52, 52, 52, 52, 52, 52, 52, 52, 52, 51, 51, 51, 51, 51, 51, 51, 51, 51, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 52, 52, 52, 53, 53, 53, 53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55, 56, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57, 57, 57, 58, 58, 58, 58, 58, 58, 59, 59, 59, 59, 59, 59, 60, 60, 60, 60, 60, 60, 61, 61, 61, 61, 61, 61, 62, 62, 62, 62, 62, 63, 63, 63, 63, 63, 64, 64, 64, 64, 64, 65, 65, 65, 65, 66, 66, 66, 66, 66, 67, 67, 67, 67, 68, 68, 68, 68, 69, 69, 69, 69, 70, 70, 70, 71, 71, 71, 71, 72, 72, 72, 73, 73, 73, 74, 74, 74, 75, 75, 75, 76, 76, 76, 77, 77, 77, 78, 78, 78, 79, 79, 80, 80, 80, 81, 81, 82, 82, 83, 83, 84, 84, 85, 85, 85, 86, 87, 87, 88, 88, 89, 89, 90, 90, 91, 92, 92, 93, 93, 94, 95, 96, 96, 97, 98, 98, 99, 100, 101, 102, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 114, 115, 116, 117, 119, 120, 121, 123, 124, 126, 127, 129, 131, 133, 135, 137, 139, 141, 143, 146, 148, 151, 154, 157, 160, 163, 167, 171, 175, 179, 184, 189, 195, 201, 208, 215, 224, 233, 244, 257, 271, 289, 310, 337, 373, 424, 503, 655, 1581};
static __IO uint32_t clockFreq = 200000;
static USB_OTG_CORE_HANDLE USB_OTG_dev __attribute__((aligned (4)));

void initUSB();

int main(void) {
    //enable FPU
    SCB->CPACR |= ((3UL << 10 * 2) | (3UL << 11 * 2));

    STM_EVAL_LEDInit(LED3);
    STM_EVAL_LEDInit(LED4);
    STM_EVAL_LEDInit(LED5);
    STM_EVAL_LEDInit(LED6);
    STM_EVAL_LEDOff(LED3);
    STM_EVAL_LEDOff(LED4);
    STM_EVAL_LEDOff(LED5);
    STM_EVAL_LEDOff(LED6);

    GPIO_InitTypeDef GPIO_InitStructure;

    /* TIM3 clock enable */
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);

    /* GPIOC and GPIOB clock enable */
    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOC | RCC_AHB1Periph_GPIOB, ENABLE);

    /* GPIOC Configuration: TIM3 CH1 (PC6) and TIM3 CH2 (PC7) */
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_6 | GPIO_Pin_7;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_OUT;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_100MHz;
    GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(GPIOC, &GPIO_InitStructure);

    /* GPIOB Configuration:  TIM3 CH3 (PB0) and TIM3 CH4 (PB1) */
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_0 | GPIO_Pin_1;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_OUT;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_100MHz;
    GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_UP;
    GPIO_Init(GPIOB, &GPIO_InitStructure);

    /* Enable the TIM3 interrupt */
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = TIM3_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);

    TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
    TIM_OCInitTypeDef TIM_OCInitStructure;
    uint16_t PrescalerValue;
    /* Compute the prescaler value */
    PrescalerValue = (uint16_t) ((SystemCoreClock / 2) / clockFreq) - 1;

    /* Time base configuration */
    TIM_TimeBaseStructure.TIM_Period = 10000;
    TIM_TimeBaseStructure.TIM_Prescaler = PrescalerValue;
    TIM_TimeBaseStructure.TIM_ClockDivision = 0;
    TIM_TimeBaseStructure.TIM_CounterMode = TIM_CounterMode_Down;
    TIM_TimeBaseInit(TIM3, &TIM_TimeBaseStructure);

    /* Channel1 first for direction */
    TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;
    TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OCInitStructure.TIM_Pulse = 2;
    TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High;
    TIM_OC1Init(TIM3, &TIM_OCInitStructure);
    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);

    /* Channel2 for step */
    TIM_OCInitStructure.TIM_OCMode = TIM_OCMode_PWM1;
    TIM_OCInitStructure.TIM_OutputState = TIM_OutputState_Enable;
    TIM_OCInitStructure.TIM_Pulse = 1;
    TIM_OCInitStructure.TIM_OCPolarity = TIM_OCPolarity_High;
    TIM_OC2Init(TIM3, &TIM_OCInitStructure);

    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);
    TIM_ITConfig(TIM3, TIM_IT_CC1| TIM_IT_CC2 | TIM_IT_Update, ENABLE);

    TIM_Cmd(TIM3, ENABLE);
    initUSB();

    STM_EVAL_PBInit(BUTTON_USER, BUTTON_MODE_GPIO);

    SYSCFG_EXTILineConfig(USER_BUTTON_EXTI_PORT_SOURCE, USER_BUTTON_EXTI_PIN_SOURCE);
    EXTI_InitTypeDef EXTI_InitStructure;
    EXTI_InitStructure.EXTI_Line = USER_BUTTON_EXTI_LINE;
    EXTI_InitStructure.EXTI_Mode = EXTI_Mode_Interrupt;
    EXTI_InitStructure.EXTI_Trigger = EXTI_Trigger_Rising_Falling;
    EXTI_InitStructure.EXTI_LineCmd = ENABLE;
    EXTI_Init(&EXTI_InitStructure);

    /* Enable and set Button EXTI Interrupt to the lowest priority */
    NVIC_InitStructure.NVIC_IRQChannel = USER_BUTTON_EXTI_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0x0F;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0x0F;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;

    NVIC_Init(&NVIC_InitStructure);
    while (1) {
    }
}

typedef struct {
    uint16_t duration;
    uint8_t xStep;
    uint8_t xDirection;
} stepDef;

stepDef currentStep;

stepDef nextStep() {
    static uint32_t index = 0;
    static int32_t progression = 1;
    static uint8_t direction = 0;
    stepDef step;
    step.duration = (uint16_t) points2[index];
    step.xStep = 1;
    step.xDirection = direction;
    index = index + progression;
    if (index == POINT_NUMBER - 1)
        index = 0;
    if (index == 0) {
        direction = direction ? 0 : 1;
    }
    return step;
}

void executeStep(stepDef step) {
    GPIO_ResetBits(GPIOB, GPIO_Pin_0);
    GPIO_ResetBits(GPIOC, GPIO_Pin_6);
    currentStep = step;
    TIM3->ARR = step.duration;
    STM_EVAL_LEDToggle(LED6);
}

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

#define ENDPOINT_ADDRESS 0b10000001U

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

__attribute__ ((used)) void TIM3_IRQHandler(void) {
    if (TIM_GetITStatus(TIM3, TIM_IT_CC1) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC1);
        if (currentStep.xDirection)
            GPIO_SetBits(GPIOB, GPIO_Pin_0);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_CC2) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC2);
        if (currentStep.xStep)
            GPIO_SetBits(GPIOC, GPIO_Pin_6);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_Update);
        executeStep(nextStep());
    }
}

static uint8_t buttonState;

__attribute__ ((used)) void EXTI0_IRQHandler(void) {
    EXTI_ClearITPendingBit(USER_BUTTON_EXTI_LINE);
    buttonState = (uint8_t) STM_EVAL_PBGetState(BUTTON_USER);
    DCD_EP_Tx(&USB_OTG_dev, ENDPOINT_ADDRESS, &buttonState, USB_PACKET_SIZE);
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