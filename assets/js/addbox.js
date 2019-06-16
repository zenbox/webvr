AFRAME.registerComponent('addbox', {

  init: function () {

    // - - - - - - - - - -
    // declaration
    // - - - - - - - - - -
    var material = {
      "metalness": "0.8",
      "roughness": "0.5",
      "transparent": "true",
      "opacity": ".7",
      "shader": "standard",
      "color": "hsl(120,100%,50%)",
      "side": "double"
    }

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

    let randomPosition = () => {
      var
        x = Math.floor(Math.random() * 20),
        y = 20 + Math.floor(Math.random() * 50),
        z = 20 + Math.floor(Math.random() * 20),
        value = x + ' ' + y + ' ' + z;

      return value;
    }

    let addboxfunc = () => {
      var
        sceneEl = document.querySelector('a-scene'),
        cubeEl = document.createElement('a-box');

      cubeEl.setAttribute('position', '0 100 -5');
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
    this.el.addEventListener('click', addboxfunc);

  }

});