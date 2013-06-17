#include "stm32f4xx_conf.h"
#include "arm_math.h"
#include "cnc.h"

static volatile uint8_t adcValue[2] = {0, 0};

static struct {
    float32_t x, y;
    float32_t deadzoneRadius;
    int32_t minFeed;
    int32_t maxFeed;
    uint8_t zeroX, zeroY;
    uint32_t steps;
    uint32_t calls;
    float32_t previousCoord, newCoord;
} manualControlStatus = {
        .x=0, .y=0,
        .deadzoneRadius = 0.12F,
        .minFeed = 20,
        .maxFeed = 10000,
        .zeroX = 128,
        .zeroY = 128};

step_t nextManualStep() {
    float32_t x = (adcValue[0] - manualControlStatus.zeroX) / 128.0F;
    float32_t y = (adcValue[1] - manualControlStatus.zeroY) / 128.0F;
    float32_t magnitude = hypotf(x, y);
    if (magnitude > 1)
        magnitude = 1;
    float32_t factor = (magnitude - manualControlStatus.deadzoneRadius) / ((1 - manualControlStatus.deadzoneRadius) * magnitude);
    if (factor <= 0)
        factor = 0;
    x *= factor;
    y *= factor;
    magnitude *= factor;
    if (magnitude < 0.70) {
        if (fabs(x) >= fabs(y))
            y = 0;
        else
            x = 0;
    }
    manualControlStatus.calls++;
    if (x != manualControlStatus.x || y != manualControlStatus.y) {
        manualControlStatus.x = x;
        manualControlStatus.y = y;
        manualControlStatus.steps = 0;
    }
    float32_t minFeedSec = manualControlStatus.minFeed / 60.0F;
    float32_t maxFeedSec = manualControlStatus.maxFeed / 60.0F;
    float32_t feedSec = powf(maxFeedSec, magnitude) * powf(minFeedSec, (1 - magnitude));
    uint16_t duration = (uint16_t) (cncMemory.parameters.clockFrequency / feedSec / cncMemory.parameters.stepsPerMillimeter);
    step_t result = {
            .duration = magnitude ? duration : 0,
            .axes = {
                    .xDirection = (unsigned int) (x >= 0),
                    .yDirection = (unsigned int) (y >= 0),
                    .zDirection = 0,
                    .zStep = 0}};
    if (x || y) {
        manualControlStatus.steps++;
        if (fabs(x) > fabs(y)) {
            float32_t xsign = (x > 0 ? 1 : -1);
            float32_t slope = xsign * y / x;
            manualControlStatus.previousCoord = (manualControlStatus.steps - 1) * slope;
            manualControlStatus.newCoord = manualControlStatus.steps * slope;
            result.axes.xStep = 1;
            result.axes.yStep = (unsigned int) (roundf(manualControlStatus.newCoord) != roundf(manualControlStatus.previousCoord));
        } else {
            float32_t ysign = (y > 0 ? 1 : -1);
            float32_t slope = ysign * x / y;
            manualControlStatus.previousCoord = (manualControlStatus.steps - 1) * slope;
            manualControlStatus.newCoord = manualControlStatus.steps * slope;
            result.axes.xStep = (unsigned int) (roundf(manualControlStatus.newCoord) != roundf(manualControlStatus.previousCoord));
            result.axes.yStep = 1;
        }
    }
    return result;
}

void zeroJoystick() {
    manualControlStatus.zeroX = adcValue[0];
    manualControlStatus.zeroY = adcValue[1];
}

void initManualControls() {
    RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);
    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_DMA2, ENABLE);
    ADC_CommonInit(&(ADC_CommonInitTypeDef) {
            .ADC_Mode = ADC_Mode_Independent,
            .ADC_Prescaler = ADC_Prescaler_Div2,
            .ADC_DMAAccessMode = ADC_DMAAccessMode_Disabled,
            .ADC_TwoSamplingDelay = ADC_TwoSamplingDelay_5Cycles});
    ADC_Init(ADC1, &(ADC_InitTypeDef) {
            .ADC_Resolution = ADC_Resolution_8b,
            .ADC_ScanConvMode = ENABLE,
            .ADC_ContinuousConvMode = ENABLE,
            .ADC_ExternalTrigConvEdge = ADC_ExternalTrigConvEdge_None,
            .ADC_DataAlign = ADC_DataAlign_Right,
            .ADC_NbrOfConversion = 2});
    DMA_Init(DMA2_Stream0, &(DMA_InitTypeDef) {
            .DMA_Channel = DMA_Channel_0,
            .DMA_PeripheralBaseAddr = (uint32_t) &(ADC1->DR),
            .DMA_Memory0BaseAddr = (uint32_t) adcValue,
            .DMA_DIR = DMA_DIR_PeripheralToMemory,
            .DMA_BufferSize = sizeof(adcValue),
            .DMA_PeripheralInc = DMA_PeripheralInc_Disable,
            .DMA_MemoryInc = DMA_MemoryInc_Enable,
            .DMA_PeripheralDataSize = DMA_PeripheralDataSize_Byte,
            .DMA_MemoryDataSize = DMA_MemoryDataSize_Byte,
            .DMA_Mode = DMA_Mode_Circular,
            .DMA_Priority = DMA_Priority_High,
            .DMA_FIFOMode = DMA_FIFOMode_Disable,
            .DMA_FIFOThreshold = DMA_FIFOThreshold_HalfFull,
            .DMA_MemoryBurst = DMA_MemoryBurst_Single,
            .DMA_PeripheralBurst = DMA_PeripheralBurst_Single});
    DMA_Cmd(DMA2_Stream0, ENABLE);
    ADC_RegularChannelConfig(ADC1, ADC_Channel_1, 1, ADC_SampleTime_3Cycles);
    ADC_RegularChannelConfig(ADC1, ADC_Channel_2, 2, ADC_SampleTime_3Cycles);
    ADC_DMARequestAfterLastTransferCmd(ADC1, ENABLE);
    ADC_DMACmd(ADC1, ENABLE);
    ADC_Cmd(ADC1, ENABLE);
    ADC_SoftwareStartConv(ADC1);
}