#include "stm32f4xx_conf.h"
#include "stm32f4_discovery.h"

static __IO uint32_t clockFreq = 200000;

extern void initUSB();

void initUserButton();

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

    RCC_AHB1PeriphClockCmd(RCC_AHB1Periph_GPIOE, ENABLE);
    GPIO_InitStructure.GPIO_Pin = GPIO_Pin_3 | GPIO_Pin_4 | GPIO_Pin_5 | GPIO_Pin_6 | GPIO_Pin_7;
    GPIO_InitStructure.GPIO_Mode = GPIO_Mode_OUT;
    GPIO_InitStructure.GPIO_Speed = GPIO_Speed_100MHz;
    GPIO_InitStructure.GPIO_OType = GPIO_OType_PP;
    GPIO_InitStructure.GPIO_PuPd = GPIO_PuPd_NOPULL;
    GPIO_Init(GPIOE, &GPIO_InitStructure);

    RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
    NVIC_InitTypeDef NVIC_InitStructure;
    NVIC_InitStructure.NVIC_IRQChannel = TIM3_IRQn;
    NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
    NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
    NVIC_Init(&NVIC_InitStructure);


    TIM_TimeBaseInitTypeDef TIM_TimeBaseStructure;
    TIM_OCInitTypeDef TIM_OCInitStructure;
    uint16_t PrescalerValue = (uint16_t) ((SystemCoreClock / 2) / clockFreq) - 1;

    TIM_Cmd(TIM3, DISABLE);
    TIM_UpdateRequestConfig(TIM3, TIM_UpdateSource_Regular);
    TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
    TIM_SetCounter(TIM3, 10000);
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
    TIM_OCInitStructure.TIM_Pulse = 1;
    TIM_OC2Init(TIM3, &TIM_OCInitStructure);

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
    EXTI_InitTypeDef EXTI_InitStructure = {
            .EXTI_Line = USER_BUTTON_EXTI_LINE,
            .EXTI_Mode = EXTI_Mode_Interrupt,
            .EXTI_Trigger = EXTI_Trigger_Rising_Falling,
            .EXTI_LineCmd = ENABLE
    };
    EXTI_Init(&EXTI_InitStructure);
    NVIC_InitTypeDef NVIC_InitStructure = {
            .NVIC_IRQChannel = USER_BUTTON_EXTI_IRQn,
            .NVIC_IRQChannelPreemptionPriority = 0x0F,
            .NVIC_IRQChannelSubPriority = 0x0F,
            .NVIC_IRQChannelCmd = ENABLE
    };
    NVIC_Init(&NVIC_InitStructure);
}

typedef struct {
    uint16_t duration;
    uint8_t xStep;
    uint8_t xDirection;
} stepDef;

static stepDef currentStep;

extern void resetBuffer();

extern uint8_t readBuffer();

uint16_t readInt() {
    uint16_t res = 0;
    res |= readBuffer();
    res |= readBuffer() << 8;
    return res;
}

stepDef nextStep() {
    static uint8_t direction = 1;
    stepDef step;
    uint32_t nextDuration = readInt();
    step.duration = (uint16_t) nextDuration;
    step.xStep = 1;
    step.xDirection = direction;
    return step;
}

void executeStep(stepDef step) {
    GPIO_ResetBits(GPIOE, GPIO_Pin_3);
    GPIO_ResetBits(GPIOE, GPIO_Pin_4);
    currentStep = step;
    if (step.duration) {
        STM_EVAL_LEDOn(LED6);
        TIM3->ARR = step.duration;
        TIM_SelectOnePulseMode(TIM3, TIM_OPMode_Single);
        TIM_Cmd(TIM3, ENABLE);
    } else {
        resetBuffer();
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
        if (currentStep.xDirection)
            GPIO_SetBits(GPIOE, GPIO_Pin_3);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_CC2) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_CC2);
        if (currentStep.xStep)
            GPIO_SetBits(GPIOE, GPIO_Pin_4);
    }
    if (TIM_GetITStatus(TIM3, TIM_IT_Update) != RESET) {
        TIM_ClearITPendingBit(TIM3, TIM_IT_Update);
        executeNextStep();
    }
}
