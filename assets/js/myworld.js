(function() {
  "use strict";
  // - - - - - - - - - -

  // - - - - -
  // DECLARATION
  window.inworld.data = ["initializing ..."];
  let flag = 0;
  /** INVENTING AN INWORLD OBJECT
   * @desc the inworld objet is a container for inworld functions,
   *       i.e. a log() that can be seen in a textframe.
   *       It uses a limited array of messages. (10 so far)
   * @version 1.0.0
   * @author Michael
   *
   * An inworld log function
   * @param {string} message any text string to set into a inworls textframe
   * @return none
   */
  inworld.log = function(message) {
    let _prefix = "> ",
      _message = message || undefined,
      _stringMessages = "",
      _objectMessages = "",
      _lastMessage = "",
      _limit = 100,
      _textLog = document.querySelector("#textLog") || undefined,
      _objectLog = document.querySelector("#objectLog") || undefined,
      _camera = document.querySelector("#rig") || undefined;

    if (_message === undefined) return false;
    if (_textLog === undefined) return false;
    if (_objectLog === undefined) return false;

    switch (typeof _message) {
      // simple string messages
      default:
        // the last message to compare with
        _lastMessage = inworld.data[inworld.data.length - 1];

        if (_lastMessage !== _message && _message.trim() !== "") {
          inworld.data.push(_message);
        }
        for (let i = 0; i < inworld.data.length; i++) {
          _stringMessages += _prefix;
          _stringMessages += inworld.data[i] + "\n";
        }
        // avoid too much entries
        if (inworld.data.length > _limit) inworld.data.shift();

        // print
        _textLog.setAttribute("value", _stringMessages);
        break;

      // but iterate objec keys and values
      case "object":
        if (flag === 0) {
          for (let _key in _message) {
            inworld.data.push(_key + ": " + _message[_key]);
          }
          for (let i = 0; i < inworld.data.length; i++) {
            _objectMessages += _prefix;
            _objectMessages += inworld.data[i] + "\n";
          }
          _objectLog.setAttribute("value", _objectMessages);
          flag = 1;
          setTimeout(function() {
            flag = 0;
          }, 5000);
        }
        break;
    }
  };

  function onController(event) {
    let key = event.key || event.type;
    let data = event.detail;
    let camera = document.querySelector("#rig") || undefined;

    //event.preventDefault();

    let x = camera.object3D.position.x;
    let y = camera.object3D.position.y;
    let z = camera.object3D.position.z;
    let delta = 0.01;

    inworld.log(key + ": " + data);
    inworld.log(event);
    return false;

    switch (key) {
      case "p":
        z += delta;
        break;
      case "ö":
        z -= delta;
        break;
      case "l":
        x -= delta;
        break;
      case "ä":
        x += delta;
        break;
      case "o":
        y += delta;
        break;
      case "ü":
        y -= delta;
        break;
      // case "triggerdown":
      // case "triggerup":
      // case "triggertouchstart":
      // case "triggertouchend":
      // case "triggerchanged":
      // OCULUS QUEST THUMBSTICK (using the thumb)
      case "thumbstickdown":
      case "thumbstickup":
      case "thumbsticktouchstart":
      case "thumbsticktouchend":
      case "thumbstickchanged":
        // OCULUS QUEST GRIP (using the middle finger)
        // case "gripdown":
        // case "gripup":
        // case "griptouchstart":
        // case "griptouchend":
        // case "gripchanged":
        // OCULUS QUEST A BUTTON
        // case "abuttondown":
        // case "abuttonup":
        // case "abuttontouchstart":
        // case "abuttontouchend":
        // case "abuttonchanged":
        // OCULUS QUEST B BUTTON
        // case "bbuttondown":
        // case "bbuttonup":
        // case "bbuttontouchstart":
        // case "bbuttontouchend":
        // case "bbuttonchanged":
        // inworld.log(event.target);
        // inworld.log(event.key);
        // inworld.log(event.data);
        break;
    }

    camera.object3D.position.x = x;
    camera.object3D.position.y = y;
    camera.object3D.position.z = z;
  }

  // // Uncomment to see a inworld.log() demo
  // // - - - - - - - - - -
  // let
  //     counter = 0,
  //     demo = setInterval(function () {
  //         inworld.log('I can count to ' + counter++ + '. Yeah!!');
  //         if (counter > 50) clearInterval(demo);
  //     }, 5000);
  // // - - - - - - - - - -

  // - - - - - - - - - -
  // CONTROLS
  function init() {
    inworld.log("ready.");

    let leftController = document.querySelector("#left-controller"),
      rightController = document.querySelector("#right-controller"),
      eventTypes = [
        // OCULUS QUEST TRIGGER (using the index finger)
        "triggerdown",
        "triggerup",
        "triggertouchstart",
        "triggertouchend",
        "triggerchanged",
        // OCULUS QUEST THUMBSTICK (using the thumb)
        "thumbstickdown",
        "thumbstickup",
        "thumbsticktouchstart",
        "thumbsticktouchend",
        "thumbstickchanged",
        // OCULUS QUEST GRIP (using the middle finger)
        "gripdown",
        "gripup",
        "griptouchstart",
        "griptouchend",
        "gripchanged",
        // OCULUS QUEST A BUTTON
        "abuttondown",
        "abuttonup",
        "abuttontouchstart",
        "abuttontouchend",
        "abuttonchanged",
        // OCULUS QUEST B BUTTON
        "bbuttondown",
        "bbuttonup",
        "bbuttontouchstart",
        "bbuttontouchend",
        "bbuttonchanged"
        // 'xbuttondown', 'xbuttonup', 'xbuttontouchstart', 'xbuttontouchend', 'xbuttonchanged',
        // 'ybuttondown', 'ybuttonup', 'ybuttontouchstart', 'ybuttontouchend', 'ybuttonchanged',
        // 'surfacedown', 'surfaceup', 'surfacetouchstart', 'surfacetouchend', 'surfacechanged'
      ];

    for (let i = 0; i < eventTypes.length; i++) {
      rightController.addEventListener(eventTypes[i], onController);
      leftController.addEventListener(eventTypes[i], onController);
    }

    document.querySelector("body").addEventListener("keyup", onController);
    document.querySelector("body").addEventListener("keypress", onController);
  }

  // AFRAME.registerComponent('box', {
  //     // the object properties
  //     // example is a box
  //     // the schema property 'width' can be called as 'this.data.width'
  //     schema: {
  //         width: {
  //             type: 'number',
  //             default: 1
  //         },
  //         height: {
  //             type: 'number',
  //             default: 1
  //         },
  //         depth: {
  //             type: 'number',
  //             default: 1
  //         },
  //         color: {
  //             type: 'color',
  //             default: 'steelblue'
  //         }
  //     },
  //     // the object behaviour after compiling
  //     init: function () {
  //         var data = this.data; // references the schema properties
  //         var el = this.el; //     references the a-frame-entity

  //         console.log(el);
  //         console.log(data);

  //         // Create geometry.
  //         this.geometry = new THREE.BoxBufferGeometry(data.width, data.height, data.depth);

  //         // Create material.
  //         this.material = new THREE.MeshStandardMaterial({
  //             color: data.color
  //         });

  //         // Create mesh.
  //         this.mesh = new THREE.Mesh(this.geometry, this.material);

  //         // Set mesh on entity.
  //         el.setObject3D('mesh', this.mesh);
  //     },
  //     update: function () {
  //         var data = this.data;
  //         var el = this.el;

  //         // If `oldData` is empty, then this means we're in the initialization process.
  //         // No need to update.
  //         if (Object.keys(oldData).length === 0) {
  //             return;
  //         }

  //         // Geometry-related properties changed. Update the geometry.
  //         if (data.width !== oldData.width ||
  //             data.height !== oldData.height ||
  //             data.depth !== oldData.depth) {
  //             el.getObject3D('mesh').geometry = new THREE.BoxBufferGeometry(data.width, data
  //                 .height,
  //                 data.depth);
  //         }

  //         // Material-related properties changed. Update the material.
  //         if (data.color !== oldData.color) {
  //             el.getObject3D('mesh').material.color = new THREE.Color(data.color);
  //         }

  //     },
  //     remove: function () {
  //         this.el.removeObject3D('mesh');
  //     }
  // })

  // let box = document.querySelector('#box').addEventListener('collide', function (event) {
  //     text.setAttribute('value', event.target);
  // })
  // - - - - -
  window.onload = function() {
    init();
  }; // window.onload()
  // - - - - - - - - - -
})();
