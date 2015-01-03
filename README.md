Webgcode
========
The beginning of a browser integrated CNC milling machine.

I have a Mac, and there are no real software to control a milling machine from that kind of computer. So I decided to hack some random pieces of technology together.
Some people might be interested so I did everything in web technologies for easy trial.

I will try to remove the dependency on g-code, since that language is just a disaster. I might keep some compatibility to help people try out this system or use it only partially.

Web Stuff
---------

A preliminary CAM system for toolpath generation is present here: http://nraynaud.github.io/webgcode/webapp/visucamTest.html#/

There is a g-code simulator here: http://nraynaud.github.io/webgcode/

Controller Board
----------------

The controller is a STM32F4-DISCOVERY board directly connected to the stepper drivers isolators (open drain configuration).
There is a USB cable between the board and the laptop, where a Chrome application controls the machine.
The controller is quite dumb, it gets a list of steps, direction and their timing from the computer and executes them. The interpolation is entirely done offline on the computer.

Pushing the user button (blue) enter the manual control mode, receiving a program on USB automatically exits the manual mode.
The orange LED is on when manual is on. The manual control is made through joysticks, I put mine directly on the spindle so that when I pull a joystick, the spindle comes.

The wiring is described in the [main.c](interpolator/main.c#L10) and [manual.c](interpolator/manual.c#L11) files.


Chrome Application
------------------

On the computer, you can send the g-code to the machine. The application's main part is simply an iframe with the normal g-code simulator web page in it.
The USB protocol is custom since I couldn't find any standard. This is all Chrome in the hope to remove OS re-compilation/deployment efforts.
