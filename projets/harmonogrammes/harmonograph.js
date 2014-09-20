var harmonograph;
paper.install(window);

window.onload = function () {
  paper.setup("paperCanvas");
  harmonograph = new Harmonograph();
  addDatGui();
  harmonograph.render();
};


var Harmonograph = function () {

  var ref = this;

  this.ratio = 1 / 3 || getUrlParameters("ratio");
  this._xy = 0.005;
  this._s = 0.0001;
  this.rotational = false;
  this.rot_prct = 0.5 * Math.random();

  this.render = function () {

    project.clear();

    var phaseX = Math.PI / 2;
    var phaseS = 0;
    var phaseY = 0;

    var amplY = 0.7 * view.center.y;
    var amplX = 0.6 * view.center.x;
    var amplS = 0.6 * view.center.x;

    var origAmpl = amplX;
    var decay = 1 / 2000;

    var time = 0;
    var tick = 0.1;
    var timePerLoop = 200;

    var freqS = (!this.rotational ? 2 : 3 / 2) * this.ratio;

    var segments = [];

    view.onFrame = null;
    view.onFrame = function (event) {

      with (ref) {

        if (amplX > 0.1) {

          for (var i = timePerLoop - 1; i >= 0; i--) {

            x = view.center.x +
            amplX * Math.sin(phaseX + time * (1 + _xy)) * (1 - rot_prct) +
            amplS * Math.sin(phaseS + time * (freqS * _s)) * rot_prct;

            if (rotational) {
              y = view.center.y +
              amplY * Math.sin(phaseY + time * ratio) * (1 - rot_prct) -
              amplS * Math.cos(phaseS + time * (freqS + _s)) * rot_prct;
            }
            else {
              y = view.center.y +
              amplY * Math.sin(phaseY + time * ratio);
            }

            amplX *= (1 - decay * tick);
            amplY *= (1 - decay * tick);
            amplS *= (1 - decay * tick);

            segments.push([x, y]);

            time += tick;
          };

          var path = new Path({
            segments: segments,
            strokeColor: "black"
          });

          path.strokeColor.alpha = Math.ceil(0.9 * (1 - amplX / origAmpl) * amplX / origAmpl * 100) / 100;
          //console.log(path.strokeColor.alpha);

          path.smooth();

          segments = [[x, y]];
        }
      }
    };
  };
};

var addDatGui = function () {

  var gui = new dat.GUI({
    load: datJSON,
    preset: "Octave"
  });

  gui.remember(harmonograph);

  gui.add(harmonograph, "ratio", 0.5, 3).onChange(function (value) {
    harmonograph.ratio = value;
    harmonograph.render();
  });

  var tune = gui.addFolder("Tune:");

  tune.add(harmonograph, "_xy", 0.005, 0.05).onChange(function (value) {
    harmonograph._xy = value;
    harmonograph.render();
  });

  tune.add(harmonograph, "_s", 0.0001, 0.01).onChange(function (value) {
    harmonograph._s = value;
    harmonograph.render();
  });

  tune.add(harmonograph, "rotational").onChange(function (value) {
    harmonograph.rotary = value;
    harmonograph.render();
  });

  tune.add(harmonograph, "rot_prct", 0, 0.5).onChange(function (value) {
    harmonograph.rot_prct = value;
    harmonograph.render();
  });

  tune.open();

  gui.add(harmonograph, "render");
};

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
    "Perfect 11th": {
      "0": {
        "ratio": 8 / 3
      }
    },
    "7th-limit jazz tuning": {
      "0": {
        "ratio": 7 / 3
      }
    }
  },
  "closed": false,
  "folders": {}
};


if (location.hostname == "localhost") {

  window.onkeyup = function(e) {

    var key = e.keyCode ? e.keyCode : e.which;
    if (key == 83) {

      var curTime = (+new Date);

      var svg = paper.project.exportSVG({asString: true});
      var blobSVG = new Blob([svg], {type: "image/svg+xml;charset=utf-8"});
      saveAs(blobSVG, curTime+'.svg');

      var blobPNG = new Blob([svg], {type: "image/png"});
      //saveAs(blobPNG, curTime+'.png');

      var jsn = {
        ratio: harmonograph.ratio,
        _xy: harmonograph._xy,
        _s: harmonograph._s,
        rotational: harmonograph.rotational,
        rot_prct: harmonograph.rot_prct,
      };

     var blobJSN = new Blob([jsn], {type: "application/json;charset=utf-8"});
      saveAs(blobJSN, curTime+'.txt');
    }
  }
}