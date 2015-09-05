#include "stm32f4xx_conf.h"
#include "cnc.h"
#include "core_cm4.h"
#include "core_cmInstr.h"

static const struct {
    GPIO_TypeDef *gpio;
    uint32_t gpioAhb1Periph;
    SPI_TypeDef *spi;
    uint8_t spiAlternateFunction;
    uint32_t spiApb1Periph;
    uint16_t spiClock, spiMosi, spiMiso, spiEnablePin;
} spiPinout = {
        .gpio = GPIOB,
        .gpioAhb1Periph = RCC_AHB1Periph_GPIOB,
        .spi = SPI2,
        .spiAlternateFunction = GPIO_AF_SPI2,
        .spiApb1Periph = RCC_APB1Periph_SPI2,
        .spiClock = GPIO_Pin_13,
        .spiMosi = GPIO_Pin_15,
        .spiMiso = GPIO_Pin_14,
        .spiEnablePin = GPIO_Pin_12
};

// 1 -> high is true, 0 -> low is true
static const spi_input_t spiInputPolarity = {
        .drv = 0,
        .upf = 0,
        .limitX = 1,
        .limitY = 1,
        .limitZ = 1
};

static uint16_t myLog2(int value) {
    return 31 - __builtin_clz(value);
}

void initSPISystem() {
    RCC_APB1PeriphClockCmd(spiPinout.spiApb1Periph, ENABLE);
    RCC_AHB1PeriphClockCmd(spiPinout.gpioAhb1Periph, ENABLE);
    GPIO_PinAFConfig(spiPinout.gpio, myLog2(spiPinout.spiClock), spiPinout.spiAlternateFunction);
    GPIO_PinAFConfig(spiPinout.gpio, myLog2(spiPinout.spiMosi), spiPinout.spiAlternateFunction);
    GPIO_PinAFConfig(spiPinout.gpio, myLog2(spiPinout.spiMiso), spiPinout.spiAlternateFunction);
    GPIO_Init(spiPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = spiPinout.spiEnablePin,
            .GPIO_Mode = GPIO_Mode_OUT,
            .GPIO_Speed = GPIO_Speed_100MHz,
            .GPIO_OType = GPIO_OType_PP});
    GPIO_Init(spiPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = spiPinout.spiClock | spiPinout.spiMosi,
            .GPIO_Mode = GPIO_Mode_AF,
            .GPIO_Speed = GPIO_Speed_100MHz,
            .GPIO_OType = GPIO_OType_PP,
            .GPIO_PuPd = GPIO_PuPd_DOWN});
    GPIO_Init(spiPinout.gpio, &(GPIO_InitTypeDef) {
            .GPIO_Pin = spiPinout.spiMiso,
            .GPIO_Mode = GPIO_Mode_AF,
            .GPIO_Speed = GPIO_Speed_100MHz,
            .GPIO_OType = GPIO_OType_PP,
            .GPIO_PuPd = GPIO_PuPd_NOPULL});
    SPI_I2S_DeInit(spiPinout.spi);
    SPI_Init(spiPinout.spi, &(SPI_InitTypeDef) {
            .SPI_Mode = SPI_Mode_Master,
            .SPI_Direction = SPI_Direction_2Lines_FullDuplex,
            .SPI_DataSize = SPI_DataSize_8b,
            .SPI_CPOL = SPI_CPOL_High,
            .SPI_CPHA = SPI_CPHA_1Edge,
            .SPI_NSS = SPI_NSS_Soft,
            .SPI_BaudRatePrescaler = SPI_BaudRatePrescaler_4,
            .SPI_FirstBit = SPI_FirstBit_MSB,
            .SPI_CRCPolynomial = 7
    });
    SPI_TIModeCmd(spiPinout.spi, DISABLE);
    SPI_Cmd(spiPinout.spi, ENABLE);
}

static void flashShiftRegisters() {
    GPIO_ResetBits(spiPinout.gpio, spiPinout.spiEnablePin);
    GPIO_SetBits(spiPinout.gpio, spiPinout.spiEnablePin);
}

void handleSPI() {
    crBegin;
            flashShiftRegisters();
            SPI_I2S_SendData(spiPinout.spi, ((spi_output_serializer_t) {.s=cncMemory.spiOutput}).n);
            while ((spiPinout.spi->SR & SPI_SR_TXE) == 0)
                crComeBackLater;
            while ((spiPinout.spi->SR & SPI_SR_RXNE) == 0)
                crComeBackLater;
            cncMemory.unfilteredSpiInput = (uint8_t) SPI_I2S_ReceiveData(spiPinout.spi) ^ ~((spi_input_serializer_t) {.s = spiInputPolarity}).n;
            while ((spiPinout.spi->SR & SPI_SR_BSY) != 0)
                crComeBackLater;
            flashShiftRegisters();
    crFinish;
}

static void debounceRunbit() {
    // when the spindle is stopped (sometimes by other means than a low signal on spindleOutput.run,
    // like estop signal, or the interface stop button), we need to release the "run" signal.
    // but there is a delay between when we set the 'run' signal and when the spindle answers with the "spindle running" signal
    // so we wait a bit.
    static uint64_t discrepancyStartTick = 0;
    crBegin;
            discrepancyStartTick += cncMemory.tick;
            while (cncMemory.tick < discrepancyStartTick + 20000) {
                if (!(cncMemory.spiOutput.run) || cncMemory.spiInput.upf)
                    crReturn;
                crComeBackLater;
            }
            cncMemory.spiOutput.run = 1;
    crFinish;
}

static int32_t spiInputFilter[8] = {0, 0, 0, 0, 0, 0, 0, 0};

static void filterSpiInput(int32_t tickDifference) {
    uint8_t result = 0;
    for (int i = 0; i < 8; i++) {
        spiInputFilter[i] = __SSAT(spiInputFilter[i] + (cncMemory.unfilteredSpiInput & (1 << i) ? tickDifference : -tickDifference), 2);
        result |= (spiInputFilter[i] > 0) << i;
    }
    cncMemory.spiInput = ((spi_input_serializer_t) {.n=result}).s;
}

void periodicSpiFunction() {
    static uint64_t lastTick;
    uint64_t tick = cncMemory.tick;
    int32_t tickDifference = (uint32_t) (tick - lastTick);
    lastTick = tick;
    debounceRunbit();
    filterSpiInput(tickDifference);
}