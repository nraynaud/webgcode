#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"
#include "math.h"
#include "arm_math.h"
#include "cnc.h"

static const struct {
    GPIO_TypeDef *gpio;
    uint16_t xDirection, xStep, yDirection, yStep, zDirection, zStep;
} motorsPinout = {
        .gpio = GPIOE,
        .xStep = GPIO_Pin_3,
        .xDirection = GPIO_Pin_4,
        .yStep = GPIO_Pin_5,
        .yDirection = GPIO_Pin_6,
        .zStep = GPIO_Pin_7,
        .zDirection = GPIO_Pin_8};

static const struct {
    GPIO_TypeDef *gpio;
    uint16_t eStopButton, eStopLed;
    uint16_t stopInterruptLine;
    uint8_t stopIrqN;
    uint8_t extiPortSource, extiPinSource;
} eStopPinout = {
        .gpio = GPIOE,
        //pin, EXTI line and EXTI IRQn should be the same, it's just poor API design
        .eStopButton = GPIO_Pin_14,
        .eStopLed = GPIO_Pin_15,
        .stopInterruptLine = EXTI_Line14,
        .stopIrqN = EXTI15_10_IRQn,
        .extiPortSource = EXTI_PortSourceGPIOE,
        .extiPinSource = EXTI_PinSource14
};

volatile cnc_memory_t cncMemory = {
        .position = {.x = 0, .y = 0, .z = 0},
        .parameters = {
                .stepsPerMillimeter = 640,
                .maxSpeed = 3000,
                .maxAcceleration = 150,
                .clockFrequency = 200000},
        .state = READY,
        .lastEvent = {NULL_EVENT, 0, 0, 0},
        .running = 0,
        .tick = 0};

static const struct {
    unsigned int x:1, y:1, z:1;
} motorDirection = {
        .x = 0,
        .y = 0,
        .z = 0};

static step_t nextProgramStep() {
    checkProgramEnd();
    uint8_t bytes[3];
    if (!readBufferArray(sizeof(bytes) / sizeof(*bytes), bytes))
        return (step_t) {.duration = 0,
                .axes = {
                        .xStep = 0,
                        .yStep = 0,
                        .zStep = 0}};
    uint8_t binAxes = bytes[2];
    return (step_t) {
            .duration = bytes[1] << 8 | bytes[0],
            .axes = {
                    .xStep = (uint8_t) ((binAxes & 0b000001) != 0),
                    .yStep = (uint8_t) ((binAxes & 0b000100) != 0),
                    .zStep = (uint8_t) ((binAxes & 0b010000) != 0),
                    .xDirection = (uint8_t) ((binAxes & 0b000010) != 0),
                    .yDirection = (uint8_t) ((binAxes & 0b001000) != 0),
                    .zDirection = (uint8_t) ((binAxes & 0b100000) != 0)}};
}

static int xor(int a, int b) {
    return (a && !b) || (!a && b);
}

static void executeStep(step_t step) {
    float32_t sqrt2 = sqrtf(2);
    float32_t sqrt3 = sqrtf(3);
    GPIO_ResetBits(motorsPinout.gpio, motorsPinout.xDirection | motorsPinout.xStep
            | motorsPinout.yDirection | motorsPinout.yStep
            | motorsPinout.zDirection | motorsPinout.zStep);
    cncMemory.currentStep = step;
    if (step.duration) {
        STM_EVAL_LEDOn(LED6);
        uint16_t directions = 0;
        if (xor(cncMemory.currentStep.axes.xDirection, motorDirection.x))
            directions |= motorsPinout.xDirection;
        if (xor(cncMemory.currentStep.axes.yDirection, motorDirection.y))
            directions |= motorsPinout.yDirection;
        if (xor(cncMemory.currentStep.axes.zDirection, motorDirection.z))
            directions |= motorsPinout.zDirection;
        GPIO_SetBits(motorsPinout.gpio, directions);
        uint32_t duration = step.duration;
        int32_t axesCount = step.axes.xStep + step.axes.yStep + step.axes.zStep;
        float32_t stepFactor = axesCount == 2 ? sqrt2 : (axesCount == 3 ? sqrt3 : 1);
        duration *= stepFactor;
        if (duration < 2)
            duration = 2;
        if (duration > 65535)
            duration = 65535;
        cncMemory.position.speed = (int32_t) (step.duration);
        TIM3->ARR = duration;
        TIM3->CNT = 0;
        TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
        TIM_Cmd(TIM3, ENABLE);
    } else {
        cncMemory.position.speed = 0;
        cncMemory.running = 0;
        TIM3->ARR = 10000;
        TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
        TIM_Cmd(TIM3, ENABLE);
    }
}

void executeNextStep() {
    if (GPIO_ReadInputDataBit(eStopPinout.gpio, eStopPinout.eStopButton)) {
        cncMemory.running = 1;
        if (cncMemory.state == MANUAL_CONTROL)
            executeStep(nextManualStep());
        else if (cncMemory.state == RUNNING_PROGRAM)
            executeStep(nextProgramStep());
        else {
            cncMemory.running = 0;
            cncMemory.position.speed = 0;
        }
    }
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

__attribute__ ((noreturn)) void main(void) {
    //enable FPU
    SCB->CPACR |= 0b000000000111100000000000000000000UL;

    STM_EVAL_LEDInit(LED3);
    STM_EVAL_LEDInit(LED4);
    STM_EVAL_LEDInit(LED5);
    STM_EVAL_LEDInit(LED6);
    STM_EVAL_LEDOff(LED3);
    STM_EVAL_LEDOff(LED4);
    STM_EVAL_LEDOff(LED5);
    STM_EVAL_LEDOff(LED6);

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOE, ENABLE);

    GPIO_Init(motorsPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = motorsPinout.xDirection | motorsPinout.xStep
                    | motorsPinout.yDirection | motorsPinout.yStep
                    | motorsPinout.zDirection | motorsPinout.zStep,
            .GPIO_Mode = GPIO_Mode_OUT,
            .GPIO_Speed = GPIO_Speed_2MHz,
            .GPIO_OType = GPIO_OType_PP,
            .GPIO_PuPd = GPIO_PuPd_NOPULL});
    GPIO_Init(eStopPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = eStopPinout.eStopButton,
            .GPIO_Mode = GPIO_Mode_IN,
            .GPIO_Speed = GPIO_Speed_2MHz,
            .GPIO_PuPd = GPIO_PuPd_DOWN
    });

    RCC_APB2PeriphClockCmd(RCC_APB2Periph_SYSCFG, ENABLE);
    SYSCFG_EXTILineConfig(eStopPinout.extiPortSource, eStopPinout.extiPinSource);
    EXTI_Init(&(EXTI_InitTypeDef) {
            .EXTI_Line = eStopPinout.stopInterruptLine,
            .EXTI_Mode = EXTI_Mode_Interrupt,
            .EXTI_Trigger = EXTI_Trigger_Rising,
            .EXTI_LineCmd = ENABLE});

    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_1);
    NVIC_Init(&(NVIC_InitTypeDef) {
            .NVIC_IRQChannel = eStopPinout.stopIrqN,
            .NVIC_IRQChannelPreemptionPriority = 0,
            .NVIC_IRQChannelSubPriority = 0,
            .NVIC_IRQChannelCmd = ENABLE});

    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
    NVIC_Init(&(NVIC_InitTypeDef) {
            .NVIC_IRQChannel = TIM3_IRQn,
            .NVIC_IRQChannelPreemptionPriority = 0,
            .NVIC_IRQChannelSubPriority = 0,
            .NVIC_IRQChannelCmd = ENABLE});

    TIM_Cmd(TIM3, DISABLE);
    TIM_UpdateRequestConfig(TIM3, TIM_UpdateSource_Regular);
    TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
    TIM3->CNT = 0;
    TIM_TimeBaseInit(TIM3, &((TIM_TimeBaseInitTypeDef) {
            .TIM_Period = 10000,
            .TIM_Prescaler = (uint16_t) ((SystemCoreClock / 2) / cncMemory.parameters.clockFrequency) - 1,
            .TIM_ClockDivision = 0,
            .TIM_CounterMode = TIM_CounterMode_Up}));
    /* Channel1 for step */
    TIM_OC1Init(TIM3, &(TIM_OCInitTypeDef) {
            .TIM_OCMode = TIM_OCMode_PWM1,
            .TIM_OutputState = TIM_OutputState_Enable,
            .TIM_Pulse = 1,
            .TIM_OCPolarity = TIM_OCPolarity_High});
    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);
    TIM_ITConfig(TIM3, TIM_IT_CC1 | TIM_IT_Update, ENABLE);

    initUSB();
    initManualControls();
    SysTick_Config(SystemCoreClock / cncMemory.parameters.clockFrequency);

    while (1);
}

__attribute__ ((used)) void SysTick_Handler(void) {
    cncMemory.tick++;
    periodicUICallback();
}

__attribute__ ((used)) void EXTI15_10_IRQHandler() {
    STM_EVAL_LEDToggle(LED5);
    if (EXTI_GetITStatus(eStopPinout.stopInterruptLine) != RESET) {
        EXTI_ClearITPendingBit(eStopPinout.stopInterruptLine);
        executeNextStep();
    }
}