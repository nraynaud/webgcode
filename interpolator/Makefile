include /Users/nraynaud/dev/STM32F4.platform/Developer/Share/Makefile
SRCS += $(wildcard *.c)
OBJS += $(SRCS:.c=.o)

CFLAGS += -std=c99


main.elf: $(OBJS)
	$(CC) $(CPPFLAGS) $(CFLAGS) $(SDK)/usr/lib/startup_stm32f4xx.s $^ -o $@  -nostdlib $(LDFLAGS) -lm -lstm32f4 -lUSB_Device -lUSB_OTG
