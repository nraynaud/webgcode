include /Users/nraynaud/dev/STM32F4.platform/Developer/Share/Makefile
SRCS += *.c
OBJS = $(SRCS:.c=.o)

main.elf: $(SRCS)
	$(CC) $(CFLAGS) $^ -o $@ -L$(SDK)/usr/lib -nostdlib -lm -lstm32f4
