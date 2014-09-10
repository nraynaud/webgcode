var nacl = nacl || {};

(function(nacl) {
  nacl.chromeMajorVersion = function() {
    var re = /Chrome\/(\d+)\.(\d+)\.(\d+)\.(\d+)/;
    var result = re.exec(navigator.userAgent);
    if (!result)
      return null;
    return +result[1];
  };

  nacl.naclMimeType = 'application/x-nacl';

  nacl.hasNaCl = function() {
    return navigator.mimeTypes[nacl.naclMimeType] !== undefined;
  };

  nacl.pnaclMimeType = 'application/x-pnacl';

  nacl.hasPNaCl = function() {
    return navigator.mimeTypes[nacl.pnaclMimeType] !== undefined;
  };

  nacl.hasEmscripten = function() {
    return window.ArrayBuffer !== undefined;
  };

  nacl.hasWebGL = function() {
    var c = document.createElement("canvas");
    var ctx = c.getContext('webgl') || c.getContext("experimental-webgl");
    return !!ctx;
  };

  nacl.hasFullscreen = function() {
    var b = document.body;
    return !!(b.requestFullscreen || b.mozRequestFullScreen || b.webkitRequestFullscreen || b.msRequestFullscreen);
  };

  nacl.hasPointerLock = function() {
    var b = document.body;
    return (b.webkitRequestPointerLock || b.mozRequestPointerLock);
  };

  nacl.hasWebAudio = function() {
    return !!(window["AudioContext"] || window["webkitAudioContext"]);
  };

  // Canonicalize the URL using the DOM.
  var resolveURL = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a.href;
  }

  // Search for a script element in the page.  The user may have loaded it
  // themselves or it could have been dynamically loaded by the subsequent code.
  var findScript = function(src) {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src === src) {
        return scripts[i];
      }
    }
    return null;
  }

  // A look-up table for the scripts we're waiting for.
  var waiting = {};

  // Make sure the specified script is loaded before invoking a callback.
  var loadScript = function(url, onload, onerror) {
    var src = resolveURL(url);
    if (findScript(src) === null) {
      // Loading the script if it cannot be found.
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;

      waiting[src] = [];
      script.onload = function() {
        for (var i in waiting[src]) {
          waiting[src][i].onload();
        }
        delete waiting[src];
      };
      script.onerror = function() {
        for (var i in waiting[src]) {
          if (waiting[src][i].onerror) {
            waiting[src][i].onerror();
          }
        }
        delete waiting[src];
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    // If src is in waiting, we have started to load the script but it is not
    // yet ready.
    if (src in waiting) {
      waiting[src].push({onload: onload, onerror: onerror});
    } else {
      // HACK assumes the script loaded successfully.
      onload();
    }
  }

  nacl.createEmscriptenInstance = function(url, width, height) {
    var e = document.createElement('span');
    e.style.display = 'inline-block';
    e.style.width = width + 'px';
    e.style.height = height + 'px';

    // Emulate an embed attributes.
    e.setAttribute('width', width);
    e.setAttribute('height', height);

    // To be called after the element is inserted into the page.
    e.load = function() {
      e.setAttribute('src', url);
      loadScript(url, function() {
        CreateInstance(width, height, e);
        e.finishLoading();
      }, function() {
        // TODO send event.
        e.readyState = 4;
        e.lastError = 'Could not load ' + url;
      });
    };
    return e;
  };

  nacl.createEmbedInstance = function(url, mimetype, width, height) {
    var e = document.createElement('embed');
    e.setAttribute('src', url);
    e.setAttribute('type', mimetype);
    e.setAttribute('width', width);
    e.setAttribute('height', height);
    // The embed actually starts loading as soon as you attach it to
    // the page, so this API lies.  If you try to set "src" after
    // putting the embed in page, however, it does not actually load.
    e.load = function() {};
    return e;
  };

})(nacl);
