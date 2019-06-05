(function() {
  console.clear();
  console.log("hey.");

  AFRAME.registerComponent("change-color-on-hover", {
    schema: {
      color: { default: "red" }
    },

    init: function() {
      var data = this.data;
      var el = this.el; // <a-box>
      var defaultColor = el.getAttribute("material").color;

      el.addEventListener("mouseenter", function() {
        el.setAttribute("color", data.color);
        console.log("enter");
      });

      el.addEventListener("mouseleave", function() {
        el.setAttribute("color", defaultColor);
        console.log("leave");
      });
    }
  });
})();
