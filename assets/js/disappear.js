AFRAME.registerComponent('disappear', {
  
  init: function () {
  
    let disappearfunc = () => {
      this.el.setAttribute("visible", false);
    };
    
    this.el.addEventListener('click', disappearfunc);
    
  }
  
 });
  
