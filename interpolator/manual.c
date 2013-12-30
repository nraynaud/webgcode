#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "arm_math.h"
#include "cnc.h"

static const struct {
    GPIO_TypeDef *gpio;
    uint16_t xControl, yControl, zControl;
    int8_t xOrientation, yOrientation, zOrientation;
} uiPinout = {
        .gpio = GPIOA,
        .xControl = GPIO_Pin_1,
        .yControl = GPIO_Pin_2,
        .zControl = GPIO_Pin_3,
        .xOrientation = 1,
        .yOrientation = 1,
        .zOrientation = 1};

static volatile struct {
    float32_t x, y, z;
    float32_t deadzoneRadius;
    float32_t snapOnAxisRadius;
    float32_t maxAcceleration;
    int32_t minFeed;
    int32_t maxFeed;
    uint8_t zeroX, zeroY, zeroZ;
    uint32_t steps;
    uint64_t lastTick;
    vec3f_t lastSpeed;
    volatile __attribute__((aligned (4))) uint8_t adcValue[3];
} manualControlStatus = {
        .deadzoneRadius = 0.12F,
        .snapOnAxisRadius = 0.70F,
        .maxAcceleration = 150,
        .minFeed = 5,
        .maxFeed = 10000,
        .zeroX = 128,
        .zeroY = 128,
        .zeroZ = 128,
        .lastTick = 0,
        .lastSpeed = {0, 0, 0},
        .adcValue = {0, 0, 0}};

static float32_t norm(vec3f_t vector) {
    //fuck [golberg91]
    return sqrtf(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}

static char findMajorAxis(vec3f_t vector) {
    double absX = fabs(vector.x);
    double absY = fabs(vector.y);
    double absZ = fabs(vector.z);
    return absX >= absY && absX >= absZ ? 'x' : (absY >= absX && absY >= absZ ? 'y' : 'z');
}

static vec3f_t snapAxes(vec3f_t speedVector) {
    float32_t magnitude = norm(speedVector);
    if (magnitude < manualControlStatus.snapOnAxisRadius) {
        vec3f_t result = {0, 0, 0};
        char majorAxis = findMajorAxis(speedVector);
        if (majorAxis == 'x')
            result.x = speedVector.x;
        else if (majorAxis == 'y')
            result.y = speedVector.y;
        else if (majorAxis == 'z')
            result.z = speedVector.z;
        return result;
    }
    return speedVector;
}

static vec3f_t joystick2speed(vec3f_t joystickPosition) {
    float32_t magnitude = norm(joystickPosition);
    if (magnitude == 0)
        return joystickPosition;
    float32_t minSpeed = manualControlStatus.minFeed / 60.0F;
    float32_t maxSpeed = manualControlStatus.maxFeed / 60.0F;
    float32_t speed = powf(maxSpeed, magnitude) * powf(minSpeed, (1 - magnitude));
    float32_t ratio = speed / magnitude;
    return (vec3f_t) {joystickPosition.x * ratio, joystickPosition.y * ratio, joystickPosition.z * ratio};
}

static void computeStep(float32_t majorAxis, float32_t axis1, uint8_t *majorStep, uint8_t *step1) {
    majorAxis = fabsf(majorAxis);
    axis1 = fabsf(axis1);
    float32_t slope = axis1 / majorAxis;
    *majorStep = 1;
    *step1 = (uint8_t) (fmodf(manualControlStatus.steps * slope, 1) < fmodf((manualControlStatus.steps - 1) * slope, 1));
}

static vec3f_t conditionJoystickPosition(vec3f_t joystickPosition) {
    float32_t magnitude = norm(joystickPosition);
    if (magnitude > 1)
        magnitude = 1;
    float32_t factor = (magnitude - manualControlStatus.deadzoneRadius) / ((1 - manualControlStatus.deadzoneRadius) * magnitude);
    if (factor <= 0 || !isfinite(factor))
        factor = 0;
    return (vec3f_t) {joystickPosition.x * factor, joystickPosition.y * factor, joystickPosition.z * factor};
}

step_t nextManualStep() {
    uint64_t currentTick = cncMemory.tick;
    vec3f_t joystickPosition = {
            .x = (manualControlStatus.adcValue[0] - manualControlStatus.zeroX) / 128.0F * uiPinout.xOrientation,
            .y = (manualControlStatus.adcValue[1] - manualControlStatus.zeroY) / 128.0F * uiPinout.yOrientation,
            .z = (manualControlStatus.adcValue[2] - manualControlStatus.zeroZ) / 128.0F * uiPinout.zOrientation};
    joystickPosition = conditionJoystickPosition(joystickPosition);
    joystickPosition = snapAxes(joystickPosition);
    vec3f_t speedVector = joystick2speed(joystickPosition);
    char majorAxis = findMajorAxis(speedVector);
    manualControlStatus.lastSpeed = speedVector;
    float32_t speed = norm(speedVector);
    uint16_t duration = (uint16_t) (cncMemory.parameters.clockFrequency / speed / cncMemory.parameters.stepsPerMillimeter);
    step_t result = {
            .duration = speed ? duration : 0,
            .axes = {
                    .xDirection = (unsigned int) (speedVector.x >= 0),
                    .yDirection = (unsigned int) (speedVector.y >= 0),
                    .zDirection = (unsigned int) (speedVector.z >= 0)}};
    manualControlStatus.steps++;
    manualControlStatus.lastTick = currentTick;
    if (speedVector.x || speedVector.y || speedVector.z) {
        if (majorAxis == 'x')
            computeStep(speedVector.x, speedVector.y, &result.axes.xStep, &result.axes.yStep);
        else if (majorAxis == 'y')
            computeStep(speedVector.y, speedVector.x, &result.axes.yStep, &result.axes.xStep);
        else
            result.axes.zStep = 1;
    }
    return result;
}

void zeroJoystick() {
    manualControlStatus.zeroX = manualControlStatus.adcValue[0];
    manualControlStatus.zeroY = manualControlStatus.adcValue[1];
    manualControlStatus.zeroZ = manualControlStatus.adcValue[2];
}

uint32_t toggleManualMode() {
    switch (cncMemory.state) {
        case READY:
            STM_EVAL_LEDOn(LED3);
            zeroJoystick();
            cncMemory.state = MANUAL_CONTROL;
            executeNextStep();
            sendEvent(ENTER_MANUAL_MODE);
            return 1;
        case MANUAL_CONTROL:
            STM_EVAL_LEDOff(LED3);
            cncMemory.state = READY;
            sendEvent(EXIT_MANUAL_MODE);
            return 1;
        default:
            return 0;
    }
}

void initManualControls() {
    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA, ENABLE);
    GPIO_Init(uiPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = uiPinout.xControl | uiPinout.yControl | uiPinout.zControl,
            .GPIO_Mode = GPIO_Mode_AN,
            .GPIO_PuPd = GPIO_PuPd_NOPULL});
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
            .ADC_NbrOfConversion = 3});
    DMA_Init(DMA2_Stream0, &(DMA_InitTypeDef) {
            .DMA_Channel = DMA_Channel_0,
            .DMA_PeripheralBaseAddr = (uint32_t) &(ADC1->DR),
            .DMA_Memory0BaseAddr = (uint32_t) manualControlStatus.adcValue,
            .DMA_DIR = DMA_DIR_PeripheralToMemory,
            .DMA_BufferSize = sizeof(manualControlStatus.adcValue),
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
    ADC_RegularChannelConfig(ADC1, ADC_Channel_3, 3, ADC_SampleTime_3Cycles);
    ADC_DMARequestAfterLastTransferCmd(ADC1, ENABLE);
    ADC_DMACmd(ADC1, ENABLE);
    ADC_Cmd(ADC1, ENABLE);
    ADC_SoftwareStartConv(ADC1);
    STM_EVAL_PBInit(BUTTON_USER, BUTTON_MODE_EXTI);
}

__attribute__ ((used)) void EXTI0_IRQHandler(void) {
    if (EXTI_GetITStatus(USER_BUTTON_EXTI_LINE) != RESET) {
        EXTI_ClearITPendingBit(USER_BUTTON_EXTI_LINE);
        toggleManualMode();
    }
}