AFRAME.registerComponent('addbox', {

  init: function () {

    // - - - - - - - - - -
    // declaration
    // - - - - - - - - - -
    var
      material = {
        "metalness": "0.8",
        "roughness": "0.5",
        "transparent": "true",
        "opacity": ".7",
        "shader": "standard",
        "color": "hsl(120,100%,50%)",
        "side": "double"
      },
      shapes = [{
        "primitive": "box",
        "width": 1,
        "height": 1,
        "depth": 1,
        "segmentsDepth": 1,
        "segmentsHeight": 1,
        "segmentsWidth": 1
      }, {
        "primitive": "circle",
        "radius": 1,
        "segments": 32,
        "thetaStart": 0,
        "thetaLength": 360
      }, {
        "primitive": "cone",
        "height": 2,
        "openEnded": false,
        "radiusBottom": 1,
        "radiusTop": 0,
        "segmentsRadial": 36,
        "segmentsHeight": 18,
        "thetaStart": 0,
        "thetaLength": 360
      }, {
        "primitive": "cylinder",
        "radius": 1,
        "height": 1,
        "segmentsRadial": 36,
        "segmentsHeight": 18,
        "openEnded": false,
        "thetaStart": 0,
        "thetaLength": 360
      }, {
        "primitive": "dodecahedron",
        "radius": 0.5
      }, {
        "primitive": "octahedron",
        "radius": 0.5
      }, {
        "primitive": "plane",
        "width": 1,
        "height": 1,
        "segmentsHeight": 1,
        "segmentsWidth": 1
      }, {
        "primitive": "ring",
        "radiusInner": 1,
        "radiusOuter": 1,
        "segmentsTheta": 32,
        "segmentsPhi": 8,
        "thetaStart": 0,
        "thetaLength": 360
      }, {
        "primitive": "sphere",
        "radius": 1,
        "segmentsWidth": 18,
        "segmentsHeight": 36,
        "phiStart": 0,
        "phiLength": 360,
        "thetaStart": 0,
        "thetaLength": 360
      }, {
        "primitive": "tetrahedron",
        "radius": 0.5
      }, {
        "primitive": "torus",
        "radius": 0.5,
        "radiusTubular": 0.2,
        "segmentsRadial": 36,
        "segmentsTubular": 32,
        "arc": 360
      }, {
        "primitive": "torusKnot",
        "radius": 0.5,
        "radiusTubular": 0.2,
        "segmentsRadial": 36,
        "segmentsTubular": 32,
        "p": 2,
        "q": 3
      }, {
        "primitive": "triangle",
        "vertexA": "0 0.5 0",
        "vertexB": "-0.5 -0.5 0",
        "vertexC": "0.5 -0.5 0"
      }];

    // - - - - - - - - - -
    // mehods
    // - - - - - - - - - -
    let json2value = (o) => {
      var
        _json = o || undefined,
        value = '';

      if (!_json) return false;
      if (typeof _json !== 'object') return false;

      for (let key in _json) {
        value += key;
        value += ':';
        value += _json[key];
        value += ';';
      }

      return value;
    }
    let randomColor = () => {
      var
        hue = Math.floor(Math.random() * 360),
        saturation = 20 + Math.floor(Math.random() * 60),
        lightness = 20 + Math.floor(Math.random() * 60),
        value = 'hsl(' + hue + ', ' + saturation + '%, ' + lightness + '%)';

      return value;
    }
    /**
     * seed infinite primitives
     */
    let seed = () => {
      setInterval(randomShape, 500);
    }
    /**
     * a random shape
     */
    let randomShape = () => {
      var
        sceneEl = document.querySelector('a-scene'),
        primitiveEl = document.createElement('a-entity');

      var index = Math.floor(Math.random() * shapes.length);

      console.log(shapes[index]['primitive'])

      var geometry = '';

      for (let key in shapes[index]) {
        geometry += key + ':' + shapes[index][key] + ";";
      }

      primitiveEl.setAttribute('geometry', geometry);
      primitiveEl.setAttribute('position', randomPosition());
      primitiveEl.setAttribute('grabbable', '');
      primitiveEl.setAttribute('dynamic-body', '');
      primitiveEl.setAttribute('shadow', '');
      primitiveEl.setAttribute('material', json2value(material))
      primitiveEl.setAttribute('color', randomColor());

      setTimeout(function () {
        primitiveEl.parentNode.removeChild(primitiveEl);
      }, 20000);

      sceneEl.appendChild(primitiveEl);

    }

    /**
     * a random x-y-z position
     */
    let randomPosition = () => {
      var
        x = -50 + Math.floor(Math.random() * 100),
        y = 50 + Math.floor(Math.random() * 50),
        z = -50 + Math.floor(Math.random() * 100),
        value = x + ' ' + y + ' ' + z;

      return value;
    }
    /**
     * add a new box
     * @return none
     */
    let addboxfunc = () => {
      var
        sceneEl = document.querySelector('a-scene'),
        cubeEl = document.createElement('a-box');

      cubeEl.setAttribute('position', randomPosition());
      cubeEl.setAttribute('grabbable', '');
      cubeEl.setAttribute('dynamic-body', '');
      cubeEl.setAttribute('shadow', '');
      cubeEl.setAttribute('material', json2value(material))
      cubeEl.setAttribute('color', randomColor());

      sceneEl.appendChild(cubeEl);
    };

    // - - - - - - - - - -
    // control, event-control
    // - - - - - - - - - -
    // this.el.addEventListener('click', addboxfunc);
    this.el.addEventListener('click', seed);

  }

});