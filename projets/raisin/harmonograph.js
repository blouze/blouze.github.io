var datJSON = {
  "remembered": {
    "Unison": {
      "0": {
        "ratio": 1
      }
    },
    "Octave": {
      "0": {
        "ratio": 2
      }
    },
    "5th": {
      "0": {
        "ratio": 3 / 2
      }
    },
    "Major 3rd": {
      "0": {
        "ratio": 5 / 4
      }
    },
    "Minor 3rd": {
      "0": {
        "ratio": 6 / 5
      }
    },
    "7th-limit jazz tuning": {
      "0": {
        "ratio": 7 / 3
      }
    },
    "Perfect 11th": {
      "0": {
        "ratio": 8 / 3
      }
    },
    "4th": {
      "0": {
        "ratio": 4 / 3
      }
    },
    "Major 6th": {
      "0": {
        "ratio": 5 / 3
      }
    },
  },
  "closed": false,
  "folders": {}
};

var harmonograph;
paper.install(window);

var scale = 1;
var pauseInterval = 5000, intervalId;
var gui;

window.onload = function () {
  paper.setup("paperCanvas");
  paper.view.viewSize = new Size(window.innerWidth * scale, window.innerHeight * scale);
  window.scroll(window.innerWidth / 2, window.innerHeight / 2);
  harmonograph = new Harmonograph();
  addDatGui();
  gui.close();
  harmonograph.render();
};


var Harmonograph = function () {

  var ref = this;

  this.ratio = 0.33;
  this.fuzzX = 0.01 + Math.random() * 0.4 / 1;
  this.fuzzS = 0.01 + Math.random() * 0.4 / 1;
  this.giro = 0.1 + Math.random() * 0.4 / 1;
  this.fuzz = 0.17;
  this.giro = 0.5;
  this.maxAlpha = 0.6;

  this.rotate = false;
  this.negative = false;
  this.autoplay = true;

  this.render = function () {

    project.clear();

    var bgRect = new Rectangle(new Point(0, 0), view.size);
    var bg = new Shape.Rectangle(bgRect);
    bg.fillColor = this.negative ? 'black' : 'white';

    var strokeColor = this.negative ? 'white' : 'black';

    var phaseX = Math.PI / 2;
    var phaseS = 0;
    var phaseY = 0;

    var amplY = 0.8 * view.center.y;
    var amplX = 0.6 * view.center.x;
    var amplS = 0.6 * view.center.x;

    var origAmpl = amplX;
    var decay = 1 / 2000;

    var time = 0;
    var tick = 0.1;
    var timePerLoop = 200;

    var freqS = (!this.rotate ? 2 : 2 / 3) * this.ratio;

    var segments = [];

    view.onFrame = null;
    view.onFrame = function (event) {

      with (ref) {

        if (amplX > 2) {

          for (var i = timePerLoop - 1; i >= 0; i--) {

            x = view.center.x
            + amplX * Math.sin(phaseX + time) * (1 - giro)
            + amplS * Math.sin(phaseS + time * freqS * (1 + fuzzS / 100)) * giro;

            if (rotate) {
              y = view.center.y
              + amplY * Math.sin(phaseY + time * ratio * (1 + fuzzX / 100)) * (1 - giro)
              - amplS * Math.cos(phaseS + time * freqS * (1 + fuzzS / 100)) * giro;
            }
            else {
              y = view.center.y
              + amplY * Math.sin(phaseY + time * ratio * (1 + fuzzX / 100));
            }

            amplX *= (1 - decay * tick);
            amplY *= (1 - decay * tick);
            amplS *= (1 - decay * tick);

            segments.push([x, y]);

            time += tick;
          };

          var path = new Path({
            segments: segments,
            strokeColor: strokeColor
          });

          path.strokeColor.alpha = maxAlpha * amplX * (1 - amplX / origAmpl) / origAmpl;

          path.smooth();

          segments = [[x, y]];
        }
        else if (autoplay) {

          if (!intervalId) {
            intervalId = setInterval(function () {

              clearInterval(intervalId);
              intervalId = null;
              ref.randomize();
              ref.render();
            }, pauseInterval);
            console.log(intervalId);
          }

          bg = new Shape.Rectangle(bgRect);
          bg.fillColor = new Color(255, 0.15);
        }
        else {

          view.onFrame = null;
        }
      }
    };
  };

  this.randomize = function () {

    var presets = Object.keys(datJSON.remembered);
    var preset = presets[Math.floor(Math.random() * presets.length)];

    ref.ratio = datJSON.remembered[preset]["0"].ratio;
    ref.fuzzX = 0.01 + Math.random() * 0.4 / 1;
    ref.fuzzS = 0.01 + Math.random() * 0.4 / 1;
    ref.giro = 0.1 + Math.random() * 0.4 / 1;
    ref.fuzz = 0.01 + Math.random() * 0.5 / 1;
    ref.giro = 0.01 + Math.random() * 0.5 / 1;

    for (var i in gui.__controllers) {
      gui.__controllers[i].updateDisplay();
    }
  };
};

var preset = "Octave";

var addDatGui = function () {

  gui = new dat.GUI({
    load: datJSON,
    preset: preset
  });

  gui.remember(harmonograph);

  gui.add(harmonograph, "ratio", 0.1, 3.0).onChange(function (value) {
    harmonograph.ratio = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "fuzzX", 0.0, 0.5).onChange(function (value) {
    harmonograph.fuzzX = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "fuzzS", 0.0, 0.5).onChange(function (value) {
    harmonograph.fuzzS = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "rotate").onChange(function (value) {
    harmonograph.rotate = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "giro", 0.0, 0.9).onChange(function (value) {
    harmonograph.giro = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "maxAlpha", 0.5, 1.5).onChange(function (value) {
    harmonograph.maxAlpha = value;
    harmonograph.render();
  });

  gui.add(harmonograph, "negative");

  gui.add(harmonograph, "autoplay");

  gui.add(harmonograph, "randomize");

  gui.add(harmonograph, "render");
};


if (location.hostname == "localhost") {

  window.onkeyup = function(e) {

    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 83) {

      var curTime = (+new Date);
/*
      var svg = paper.project.exportSVG({asString: true});
      var blobSVG = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
      saveAs(blobSVG, curTime+'.svg');

      */
      var jsn = "{"
      + "ratio: harmonograph.ratio,"
      + "fuzz: harmonograph.fuzz,"
      + "rotate: harmonograph.rotate,"
      + "giro: harmonograph.giro"
      + "}";
      var blobJSN = new Blob([jsn], {type: "application/json;charset=utf-8"});
      saveAs(blobJSN, curTime+'.txt');

      var paperCanvas = document.getElementById("paperCanvas");

      var highResCanvas = document.createElement("canvas");
      var newContext = highResCanvas.getContext('2d');
      var scale = 3.0;
      highResCanvas.width = paperCanvas.width * scale;
      highResCanvas.height = paperCanvas.height * scale;
      newContext.scale = 1 / scale;
      newContext.drawImage(paperCanvas, 0, 0, highResCanvas.width, highResCanvas.height);

      //highResCanvas.toBlob(function (blob) {
        paperCanvas.toBlob(function (blob) {
          saveAs(blob, curTime+'.png');
        },
        'image/png'
        );
      }
    }
  }