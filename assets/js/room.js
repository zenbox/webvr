!(function () {
    'use strict';

    function box() {
        const data = {
            "position": "0 20 " + (-5 - Math.round(Math.random() * 3)),
            "class": "new-cube",
            "width": 0.1,
            "depth": 0.1,
            "height": 0.1,
            "material": {
                "metalness": 1,
                "roughness": 0.5,
                "transparent": false,
                "opacity": 1,
                "shader": "standard",
                "color": "hsl(00, 100% , 50% )",
                "side": "double"
            },
            "grabbable": true,
            "velocity": true,
            "dynamic-body": true,
            "shadow": true,
            "geometry": true
        };


        let primitive = document.createElement('a-box');

        for (let key in data) {
            if (typeof data[key] !== 'object' && typeof data[key] !== 'boolean') {
                primitive.setAttribute(key, data[key]);
            } else if (typeof data[key] === 'boolean') {
                primitive.setAttribute(key, '')
            } else {
                let
                    value = '',
                    d = data[key];
                for (let key in d) {
                    value += key + ":" + d[key] + ';';
                }
                primitive.setAttribute(key, value);
            }
        }
        return primitive;
    }

    function main() {
        let i = 0;
        let boxes = setInterval(function () {
            document
                .querySelector('a-scene')
                .appendChild(box());
            i++;
            if (i > 100) clearInterval(boxes);
        }, 50);

        console
            .dir(document.querySelector('.cube'));
    }

    window.onload = main;
})()