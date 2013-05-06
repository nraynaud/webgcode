#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"

static __IO uint32_t clockFreq = 200000;

extern void initUSB();

void initUserButton();

static const struct {
    uint16_t xDirection, xStep, yDirection, yStep, zDirection, zStep;
} pinout = {
        .xDirection = GPIO_Pin_3,
        .xStep = GPIO_Pin_4,
        .yDirection = GPIO_Pin_5,
        .yStep=GPIO_Pin_6,
        .zDirection=GPIO_Pin_7,
        .zStep=GPIO_Pin_8};

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

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOE, ENABLE);

    GPIO_InitTypeDef gpioConfig = {
            .GPIO_Pin = pinout.xDirection | pinout.xStep | pinout.yDirection | pinout.yStep | pinout.zDirection | pinout.zStep,
            .GPIO_Mode = GPIO_Mode_OUT,
            .GPIO_Speed = GPIO_Speed_2MHz,
            .GPIO_OType = GPIO_OType_PP,
            .GPIO_PuPd = GPIO_PuPd_NOPULL};
    GPIO_Init(GPIOE, &gpioConfig);

    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_1);
    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
    NVIC_InitTypeDef nvicConfig = {
            .NVIC_IRQChannel = TIM3_IRQn,
            .NVIC_IRQChannelPreemptionPriority = 0,
            .NVIC_IRQChannelSubPriority = 0,
            .NVIC_IRQChannelCmd = ENABLE};
    NVIC_Init(&nvicConfig);

    uint16_t PrescalerValue = (uint16_t) ((SystemCoreClock / 2) / clockFreq) - 1;

    TIM_Cmd(TIM3, DISABLE);
    TIM_UpdateRequestConfig(TIM3, TIM_UpdateSource_Regular);
    TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
    TIM_SetCounter(TIM3, 10000);

    TIM_TimeBaseInitTypeDef timeBaseConfig = {
            .TIM_Period = 10000,
            .TIM_Prescaler = PrescalerValue,
            .TIM_ClockDivision = 0,
            .TIM_CounterMode = TIM_CounterMode_Down};
    TIM_TimeBaseInit(TIM3, &timeBaseConfig);

    /* Channel1 for direction */
    TIM_OCInitTypeDef timeChannelConfig = {
            .TIM_OCMode = TIM_OCMode_PWM1,
            .TIM_OutputState = TIM_OutputState_Enable,
            .TIM_Pulse = 2,
            .TIM_OCPolarity = TIM_OCPolarity_High};
    TIM_OC1Init(TIM3, &timeChannelConfig);
    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);

    /* Channel2 for step */
    timeChannelConfig.TIM_Pulse = 1;
    TIM_OC2Init(TIM3, &timeChannelConfig);

    TIM_OC1PreloadConfig(TIM3, TIM_OCPreload_Disable);
    TIM_ITConfig(TIM3, TIM_IT_CC1| TIM_IT_CC2 | TIM_IT_Update, ENABLE);

    initUSB();
    initUserButton();
    while (1) {
    }
}

void initUserButton() {
    STM_EVAL_PBInit(BUTTON_USER, BUTTON_MODE_GPIO);
    //init the interrupt by hand to set a lower-priority than what STM_EVAL_PBInit() would do
    SYSCFG_EXTILineConfig(USER_BUTTON_EXTI_PORT_SOURCE, USER_BUTTON_EXTI_PIN_SOURCE);
    EXTI_InitTypeDef extiConfig = {
            .EXTI_Line = USER_BUTTON_EXTI_LINE,
            .EXTI_Mode = EXTI_Mode_Interrupt,
            .EXTI_Trigger = EXTI_Trigger_Rising_Falling,
            .EXTI_LineCmd = ENABLE};
    EXTI_Init(&extiConfig);
    NVIC_InitTypeDef nvicConfig = {
            .NVIC_IRQChannel = USER_BUTTON_EXTI_IRQn,
            .NVIC_IRQChannelPreemptionPriority = 0x0F,
            .NVIC_IRQChannelSubPriority = 0x0F,
            .NVIC_IRQChannelCmd = ENABLE};
    NVIC_Init(&nvicConfig);
}


extern uint8_t readBuffer();

typedef struct __attribute__((packed)) {
    unsigned int xStep : 1;
    unsigned int xDirection : 1;
    unsigned int yStep : 1;
    unsigned int yDirection : 1;
    unsigned int zStep : 1;
    unsigned int zDirection :1;
    unsigned int :2;
} axes_t;

typedef struct {
    uint16_t duration;
    axes_t axes;
} step_t;

static step_t nextStep() {
    uint16_t nextDuration = 0;
    nextDuration |= readBuffer();
    nextDuration |= readBuffer() << 8;
    union {
        axes_t as;
        uint8_t ab;
    } axes = {.ab = readBuffer()};
    step_t step = {nextDuration, axes.as};
    return step;
}

volatile uint8_t running = 0;
volatile static step_t currentStep;

static void executeStep(step_t step) {
    GPIO_ResetBits(GPIOE, pinout.xDirection | pinout.xStep | pinout.yDirection | pinout.yStep | pinout.zDirection | pinout.zStep);
    currentStep = step;
    if (step.duration) {
        running = 1;
        STM_EVAL_LEDOn(LED6);
        TIM3->ARR = step.duration;
        TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
        TIM_Cmd(TIM3, ENABLE);
    } else {
        running = 0;
        STM_EVAL_LEDOff(LED6);
    }
}

void executeNextStep() {
    executeStep(nextStep());
}

extern uint32_t sendInterrupt(uint8_t *buffer, uint32_t len);

static uint8_t buttonState;

__attribute__ ((used)) void EXTI0_IRQHandler(void) {
    EXTI_ClearITPendingBit(USER_BUTTON_EXTI_LINE);
    buttonState = (uint8_t) STM_EVAL_PBGetState(BUTTON_USER);
    sendInterrupt(&buttonState, 1);
}

__attribute__ ((used)) void TIM3_IRQHandler(void) {
    if (TIM_GetITStatus(TIM3, TIM_IT_CC1) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC1);
        uint16_t directions = 0;
        if (currentStep.axes.xDirection)
            directions |= pinout.xDirection;
        if (currentStep.axes.yDirection)
            directions |= pinout.yDirection;
        if (currentStep.axes.zDirection)
            directions |= pinout.zDirection;
        GPIO_SetBits(GPIOE, directions);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_CC2) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC2);
        uint16_t steps = 0;
        if (currentStep.axes.xStep)
            steps |= pinout.xStep;
        if (currentStep.axes.yStep)
            steps |= pinout.yStep;
        if (currentStep.axes.zStep)
            steps |= pinout.zStep;
        GPIO_SetBits(GPIOE, steps);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_Update);
        executeNextStep();
    }
}
