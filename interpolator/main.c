#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "cnc.h"

static const struct {
    GPIO_TypeDef *gpio;
    uint16_t xDirection, xStep, yDirection, yStep, zDirection, zStep;
} motorsPinout = {
        .gpio=GPIOE,
        .xDirection = GPIO_Pin_3,
        .xStep = GPIO_Pin_4,
        .yDirection = GPIO_Pin_5,
        .yStep=GPIO_Pin_6,
        .zDirection=GPIO_Pin_7,
        .zStep=GPIO_Pin_8};

static const struct {
    GPIO_TypeDef *gpio;
    uint16_t plugged, xControl, yControl;
} uiPinout = {
        .gpio = GPIOA,
        .xControl=GPIO_Pin_1,
        .yControl=GPIO_Pin_2};

volatile cnc_memory_t cncMemory = {
        .position = {.x=0, .y=0, .z=0},
        .parameters = {
                .stepsPerMillimeter=640,
                .maxSpeed = 3000,
                .maxAcceleration = 150,
                .clockFrequency = 200000},
        .state = READY,
        .lastEvent = {NULL_EVENT, 0, 0, 0},
        .running = 0};

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

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOA | RCC_AHB1Periph_GPIOE, ENABLE);

    GPIO_Init(motorsPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = motorsPinout.xDirection | motorsPinout.xStep
                    | motorsPinout.yDirection | motorsPinout.yStep
                    | motorsPinout.zDirection | motorsPinout.zStep,
            .GPIO_Mode = GPIO_Mode_OUT,
            .GPIO_Speed = GPIO_Speed_2MHz,
            .GPIO_OType = GPIO_OType_PP,
            .GPIO_PuPd = GPIO_PuPd_NOPULL});
    GPIO_Init(uiPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = uiPinout.xControl | uiPinout.yControl,
            .GPIO_Mode = GPIO_Mode_AN,
            .GPIO_PuPd = GPIO_PuPd_NOPULL});

    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_1);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
    NVIC_Init(&(NVIC_InitTypeDef) {
            .NVIC_IRQChannel = TIM3_IRQn,
            .NVIC_IRQChannelPreemptionPriority = 0,
            .NVIC_IRQChannelSubPriority = 0,
            .NVIC_IRQChannelCmd = ENABLE});

    uint16_t PrescalerValue = (uint16_t) ((SystemCoreClock / 2) / cncMemory.parameters.clockFrequency) - 1;
    TIM_Cmd(TIM3, DISABLE);
    TIM_UpdateRequestConfig(TIM3, TIM_UpdateSource_Regular);
    TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
    TIM_SetCounter(TIM3, 10000);

    TIM_TimeBaseInit(TIM3, &((TIM_TimeBaseInitTypeDef) {
            .TIM_Period = 10000,
            .TIM_Prescaler = PrescalerValue,
            .TIM_ClockDivision = 0,
            .TIM_CounterMode = TIM_CounterMode_Down}));
    /* Channel1 for direction */
    TIM_OC1Init(TIM3, &(TIM_OCInitTypeDef) {
            .TIM_OCMode = TIM_OCMode_PWM1,
            .TIM_OutputState = TIM_OutputState_Enable,
            .TIM_Pulse = 2,
            .TIM_OCPolarity = TIM_OCPolarity_High});
    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);
    /* Channel2 for step */
    TIM_OC2Init(TIM3, &(TIM_OCInitTypeDef) {
            .TIM_OCMode = TIM_OCMode_PWM1,
            .TIM_OutputState = TIM_OutputState_Enable,
            .TIM_Pulse = 1,
            .TIM_OCPolarity = TIM_OCPolarity_High});

    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);
    TIM_ITConfig(TIM3, TIM_IT_CC1| TIM_IT_CC2 | TIM_IT_Update, ENABLE);
    initUSB();
    while (1) {
    }
}

static const struct {
    unsigned int x:1, y:1, z:1;
} motorDirection = {
        .x = 0,
        .y = 0,
        .z = 1};

static step_t nextStep() {
    uint16_t nextDuration = 0;
    nextDuration |= readBuffer();
    nextDuration |= readBuffer() << 8;
    return (step_t) {
            .duration = nextDuration,
            .axes = ((union {
                axes_t s;
                uint8_t b;
            }) {.b = readBuffer()}).s};
}

static void executeStep(step_t step) {
    GPIO_ResetBits(motorsPinout.gpio, motorsPinout.xDirection | motorsPinout.xStep | motorsPinout.yDirection | motorsPinout.yStep | motorsPinout.zDirection | motorsPinout.zStep);
    cncMemory.currentStep = step;
    if (step.duration) {
        STM_EVAL_LEDOn(LED6);
        TIM3->ARR = step.duration;
        TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
        TIM_Cmd(TIM3, ENABLE);
    } else
        cncMemory.running = 0;
}

void executeNextStep() {
    cncMemory.running = 1;
    executeStep(nextStep());
}

void updatePosition(step_t step) {
    if (step.axes.xStep)
        cncMemory.position.x += step.axes.xDirection ? 1 : -1;
    if (step.axes.yStep)
        cncMemory.position.y += step.axes.yDirection ? 1 : -1;
    if (step.axes.zStep)
        cncMemory.position.z += step.axes.zDirection ? 1 : -1;
}

__attribute__ ((used)) void TIM3_IRQHandler(void) {
    if (TIM_GetITStatus(TIM3, TIM_IT_CC1) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC1);
        uint16_t directions = 0;
        if (cncMemory.currentStep.axes.xDirection ^ motorDirection.x)
            directions |= motorsPinout.xDirection;
        if (cncMemory.currentStep.axes.yDirection ^ motorDirection.y)
            directions |= motorsPinout.yDirection;
        if (cncMemory.currentStep.axes.zDirection ^ motorDirection.z)
            directions |= motorsPinout.zDirection;
        GPIO_SetBits(motorsPinout.gpio, directions);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_CC2) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC2);
        uint16_t steps = 0;
        if (cncMemory.currentStep.axes.xStep)
            steps |= motorsPinout.xStep;
        if (cncMemory.currentStep.axes.yStep)
            steps |= motorsPinout.yStep;
        if (cncMemory.currentStep.axes.zStep)
            steps |= motorsPinout.zStep;
        GPIO_SetBits(motorsPinout.gpio, steps);
        updatePosition(cncMemory.currentStep);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_Update);
        STM_EVAL_LEDOff(LED6);
        executeNextStep();
    }
}
