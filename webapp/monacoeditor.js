require.config({
  paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" },
});
window.MonacoEnvironment = { getWorkerUrl: () => proxy };

let proxy = URL.createObjectURL(
  new Blob(
    [
      `
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@0.44.0/min/'
	};
	importScripts('https://unpkg.com/monaco-editor@0.44.0/min/vs/base/worker/workerMain.js');
`,
    ],
    { type: "text/javascript" }
  )
);

require(["vs/editor/editor.main"], () => {
  // Register a new language
  monaco.languages.register({ id: "gcode" });

  monaco.languages.setLanguageConfiguration("gcode", {
    comments: {
      lineComment: ";",
      blockComment: ["(", ")"],
    },
  });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider("gcode", {
    tokenizer: {
      root: [
        [/[GM]\d+/, "gcode-command"],
        [/\(.+?\)/, "gcode-bracket-comment"],
        [/;\s*.*/, "gcode-line-comment"],
        [/[XYZ]-?\d+\.*\d*/, "gcode-basic-axis"],
        [/[IJKR]-?\d+\.*\d*/, "gcode-adv-axis"],
      ],
    },
  });

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme("gcodeTheme", {
    base: "vs-dark",
    inherit: true,
    rules: [
      //
      { token: "gcode-command", foreground: "64aeed", fontStyle: "bold" },
      { token: "gcode-bracket-comment", foreground: "5d646f" },
      { token: "gcode-line-comment", foreground: "5d646f" },
      { token: "gcode-basic-axis", foreground: "e65561" },
      { token: "gcode-adv-axis", foreground: "cf965f" },
    ],
    colors: {
      "editor.foreground": "#ffffff",
    },
  });

  monaco.languages.registerHoverProvider("gcode", {
    provideHover: (model, position) => {
      // Get the word at the current position
      const word = model.getWordAtPosition(position);

      if (word) {
        const keyword = word.word;
        let documentation = "";

        for (const [key, value] of Object.entries(HOVER_DOCUMENTATION)) {
          if (key === keyword) {
            documentation = value.documentation;
            break;
          }
        }

        if (documentation) {
          return {
            range: new monaco.Range(
              position.lineNumber,
              word.startColumn,
              position.lineNumber,
              word.endColumn
            ),
            contents: [
              { value: `**${keyword}**`, isTrusted: true },
              { value: documentation },
            ],
          };
        }
      }

      return null;
    },
  });

  // Register a completion item provider for the new language
  monaco.languages.registerCompletionItemProvider("gcode", {
    provideCompletionItems: (model, position) => {
      var word = model.getWordUntilPosition(position);
      var range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      if (!(localStorage.getItem('suggestionsToggle') == 'true')){
        return { suggestions: [] };
      }

      var suggestions = [];

      if (word.startColumn == 1) { // if typing at the start of the line, provide gcode command extensions
        // add range to each of GCODE_SUGGESTIONS
        suggestions = GCODE_SUGGESTIONS.map((s) => {
          return {
            ...s,
            range: range,
            kind: monaco.languages.CompletionItemKind.Function,
          };
        });
      }
      return { suggestions: suggestions };
    },
  });
  // document.getElementById("container")
  window.editor = monaco.editor.create(document.getElementById("container"), {
    theme: "gcodeTheme",
    value: getCode(),
    language: "gcode",
    suggest: {
      showInlineDetails: true,
      showWords: false,
    },
  });

  window.setMarker = function setMarker(editor, line, message) {
    var model = editor.getModel();
    if (!model) {
      return;
    }
  
    var markers = monaco.editor.getModelMarkers({ resource: model.uri });
    var existingMarker = markers.find(function (marker) {
      return marker.startLineNumber === line && marker.message === message;
    });
  
    if (existingMarker) {
      return; // Avoid duplicate markers
    }
  
    var newMarker = {
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: line,
      endLineNumber: line,
      startColumn: 1,
      endColumn: model.getLineMaxColumn(line),
      message: message
    };
  
    monaco.editor.setModelMarkers(model, 'custom-marker', [newMarker]);
  }

  window.clearMarkers = function clearMarkers(editor) {
    var model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, 'custom-marker', []);
    }
  }

  function getCode() {
    return [
      "G0 Y10 Z-5",
      "G1 Z-10",
      "G1 Y20",
      "G02 X10 Y30 R10",
      "G1 X30",
      "G2 X40 Y20 R10",
      "G1 Y10",
      "G2 X30 Y0 R10",
      "G1 X10",
      "G2 X0 Y10 Z-15 R10 (yeah spiral !)",
      "G3 X-10 Y20 R-10 (yeah, long arc !)",
      "G3 X0 Y10 I10 (center)",
      "G91 G1 X10 Z10",
      "G3 Y10 R5 Z3 (circle in incremental)",
      "Y10 R5 Z3 (again, testing modal state)",
      "G20 G0 X1 (one inch to the right)",
      "G3 X-1 R1 (radius in inches)",
      "G3 X1 Z0.3 I0.5 J0.5 (I,J in inches)",
      "G21 (back to mm)",
      "G80 X10 (do nothing)",
      "G90",
      "G0 X30 Y30 Z30",
      "G18 (X-Z plane)",
      "G3 Z40 I0 K5",
      "G19 (Y-Z plane)",
      "G3 Z50 J0 K5",
      "G17 (back to X-Y plane)",
    ].join("\n");
  }
});
