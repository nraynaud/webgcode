var GCODE_SUGGESTIONS = [
  { label: "G00 - Rapid Movement", insertText: "G00" },
  { label: "G01 - Linear Move", insertText: "G01" },
  { label: "G02 - CW Circle", insertText: "G02" },
  { label: "G03 - CCW Circle", insertText: "G03" },
  { label: "G17 - XY Plane Selection", insertText: "G17" },
  { label: "G18 - XZ Plane Selection", insertText: "G18" },
  { label: "G19 - YZ Plane Selection", insertText: "G19" },
  { label: "G20 - Inches Mode", insertText: "G20" },
  { label: "G21 - Metric Mode", insertText: "G21" },
  { label: "G28 - Auto Home", insertText: "G28" },
  { label: "G40 - Cancel Cutter Compensation", insertText: "G40" },
  { label: "G41 - Cutter Compensation Left", insertText: "G41" },
  { label: "G42 - Cutter Compensation Right", insertText: "G42" },
  { label: "G43 - Tool Length Compensation", insertText: "G43" },
  { label: "G73 - High Speed Peck Drilling", insertText: "G73" },
  { label: "G74 - Left Hand Tapping", insertText: "G74" },
  { label: "G76 - Fine Boring Canned Cycle", insertText: "G76" },
  { label: "G80 - Canned Cycle Cancel", insertText: "G80" },
  { label: "G81 - Standard Drilling Cycle", insertText: "G81" },
  { label: "G90 - Absolute Mode Positioning", insertText: "G90" },
  { label: "G91 - Relative Mode Positioning", insertText: "G91" },
  { label: "G94 - Feed per Minute Mode", insertText: "G94" },
  { label: "G95 - Feed per Revolution Mode", insertText: "G95" },
  { label: "G96 - Constant Surface Speed", insertText: "G96" },
  { label: "G97 - Constant Spindle Speed", insertText: "G97" },
];

var HOVER_DOCUMENTATION = {
    G00: {
        documentation: "G00 - Rapid Movement\n\nThis command is used for rapid positioning or fast traverse of the tool to a specified location without cutting. It does not take any feed rate into account, and the tool moves at maximum speed. Use this command when you need to move the tool quickly to a new position.\n\nExample usage: G00 X10 Y5 Z3"
    },
    G01: {
        documentation: "G01 - Linear Move\n\nThe G01 command is used for linear movement, where the tool moves in a straight line from the current position to the specified coordinates. The feed rate should be specified to control the speed of the movement. This command is commonly used for straight-line cuts and contouring.\n\nExample usage: G01 X20 Y10 F100"
    },
    G02: {
        documentation: "G02 - Clockwise Circle\n\nG02 is used to create a clockwise circular or arc motion. It requires specifying the endpoint of the arc (X, Y) and the arc radius (R). The tool moves in a circular path from the current position to the endpoint, with a clockwise direction.\n\nExample usage: G02 X30 Y20 R10"
    },
    G03: {
        documentation: "G03 - Counterclockwise Circle\n\nG03 is similar to G02 but creates a counterclockwise circular or arc motion. It requires specifying the endpoint (X, Y) and the arc radius (R). The tool moves in a circular path from the current position to the endpoint in a counterclockwise direction.\n\nExample usage: G03 X10 Y20 R5"
    },
    G17: {
        documentation: "G17 - XY Plane Selection\n\nG17 selects the XY plane as the active plane for cutting or movement. It is commonly used in CNC machining to specify that the tool movements and cutting operations should be performed in the XY plane.\n\nExample usage: G17"
    },
    G18: {
        documentation: "G18 - XZ Plane Selection\n\nG18 selects the XZ plane as the active plane for cutting or movement. It specifies that the tool operations should be performed in the XZ plane. This is often used for special machining operations.\n\nExample usage: G18"
    },
    G19: {
        documentation: "G19 - YZ Plane Selection\n\nG19 selects the YZ plane as the active plane for cutting or movement. It specifies that the tool operations should be performed in the YZ plane. Like G18, G19 is used for special machining operations.\n\nExample usage: G19"
    },
    G20: {
        documentation: "G20 - Inches Mode\n\nG20 sets the measurement units to inches. When G20 is active, all length and coordinate values are interpreted as inches. It is used for specifying dimensions in inches.\n\nExample usage: G20"
    },
    G21: {
        documentation: "G21 - Metric Mode\n\nG21 sets the measurement units to metric units. When G21 is active, all length and coordinate values are interpreted in millimeters. It is used for specifying dimensions in the metric system.\n\nExample usage: G21"
    },
    G28: {
        documentation: "G28 - Auto Home\n\nG28 is used to return the machine to its home or reference position automatically. The exact behavior may vary depending on the machine configuration. This command is used to initiate an automatic homing sequence.\n\nExample usage: G28"
    },
    G40: {
        documentation: "G40 - Cancel Cutter Compensation\n\nG40 is used to cancel any active cutter radius compensation (CRC) that may be in effect. It ensures that the toolpath follows the programmed path without any offset due to cutter compensation.\n\nExample usage: G40"
    },
    G41: {
        documentation: "G41 - Cutter Compensation Left\n\nG41 activates cutter compensation to the left side of the toolpath. It specifies that the tool should move with an offset to the left of the programmed path. This is used in contouring and similar operations.\n\nExample usage: G41 D1"
    },
    G42: {
        documentation: "G42 - Cutter Compensation Right\n\nG42 activates cutter compensation to the right side of the toolpath. It specifies that the tool should move with an offset to the right of the programmed path. This is used in contouring and similar operations.\n\nExample usage: G42 D2"
    },
    G43: {
        documentation: "G43 - Tool Length Compensation\n\nG43 is used to enable tool length compensation (TLC). It adjusts the tool's position based on its length. This command is often used in CNC machining to ensure that the tool reaches the correct depth in the material.\n\nExample usage: G43 H1"
    },
    G73: {
        documentation: "G73 - High-Speed Peck Drilling\n\nG73 is used for high-speed peck drilling operations. It is a canned cycle for drilling holes in a material. The exact behavior may depend on the machine configuration and parameters specified.\n\nExample usage: G73 X10 Y5 Z-20 Q5"
    },
    G74: {
        documentation: "G74 - Left Hand Tapping\n\nG74 is a canned cycle used for left-hand tapping operations. It is used to create threaded holes in a material with a left-hand thread. The exact behavior may depend on the machine configuration and parameters specified.\n\nExample usage: G74 X20 Y15 Z-10 R3.5"
    },
    G76: {
        documentation: "G76 - Fine Boring Canned Cycle\n\nG76 is a canned cycle used for fine boring operations. It is used to create precise bores or holes in a material. The exact behavior may depend on the machine configuration and parameters specified.\n\nExample usage: G76 X30 Y25 Z-5 R2.0"
    },
    G80: {
        documentation: "G80 - Canned Cycle Cancel\n\nG80 is used to cancel any active canned cycle. It ensures that the tool operates in normal mode, without any predefined cycles. This command is often used to exit any canned cycle that may be in progress.\n\nExample usage: G80"
    },
    G81: {
        documentation: "G81 - Standard Drilling Cycle\n\nG81 is a canned cycle used for standard drilling operations. It is used to create simple drilled holes in a material. The exact behavior may depend on the machine configuration and parameters specified.\n\nExample usage: G81 X10 Y10 Z-15 R2.0 F100"
    },
    G90: {
        documentation: "G90 - Absolute Mode Positioning\n\nG90 sets the tool positioning mode to absolute mode. In this mode, all coordinate values represent absolute positions from the machine's reference point. It is used for precise positioning.\n\nExample usage: G90 G1 X100 Y50 Z25"
    },
    G91: {
        documentation: "G91 - Relative Mode Positioning\n\nG91 sets the tool positioning mode to relative mode. In this mode, all coordinate values represent relative distances from the current position. It is often used for incremental movements.\n\nExample usage: G91 G1 X10 Y-5 Z3"
    },
    G94: {
        documentation: "G94 - Feed per Minute Mode\n\nG94 sets the feed rate mode to feed per minute. In this mode, the feed rate is specified in inches or millimeters per minute, depending on the measurement units (G20 or G21). It is used for controlling the tool's speed.\n\nExample usage: G94 F200"
    },
    G95: {
        documentation: "G95 - Feed per Revolution Mode\n\nG95 sets the feed rate mode to feed per revolution. In this mode, the feed rate is specified in inches or millimeters per revolution of the spindle. It is often used in turning operations where the tool moves in sync with the spindle rotation.\n\nExample usage: G95 F0.05"
    },
    G96: {
        documentation: "G96 - Constant Surface Speed\n\nG96 is used to set the spindle speed based on constant surface speed. The spindle speed is adjusted to maintain a constant cutting speed, which is useful in operations where the cutting speed needs to remain consistent.\n\nExample usage: G96 S1000"
    },
    G97: {
        documentation: "G97 - Constant Spindle Speed\n\nG97 sets the spindle speed to a constant value in revolutions per minute (RPM). It is often used when you want to specify a fixed spindle speed for the machining operation.\n\nExample usage: G97 S2000"
    },
};