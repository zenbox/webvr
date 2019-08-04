 // REGISTER AFRAME COMPONENTS
 AFRAME.registerComponent('log', {
     schema: {
         message: {
             type: 'string',
             default: 'Hello, World!'
         }
     },

     init: function () {
         inworld.log(this.data.message);
     }
 });