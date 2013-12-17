include /Users/nraynaud/dev/STM32F4.platform/Developer/Share/Makefile
SRCS += $(wildcard *.c)
OBJS += $(SRCS:.c=.o)

CFLAGS += -std=c99
LDFLAGS += -nostdlib -lm -lstm32f4 -lUSB_Device -lUSB_OTG

main.elf: $(OBJS)
	$(CC) $(CPPFLAGS) $(CFLAGS) $^ -o $@ $(LDFLAGS)
