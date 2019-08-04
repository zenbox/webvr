var pageLoad = new Date();
var lastSessionStart = null;
var session = null; // session for WebXR Device API
var display = null; // display for WebVR 1.1
var displays = null; // displays for WebVR 1.1
var vrInitialized = false;

var nativeWebXR = 'xr' in navigator;
var versionShim;
if(!('forceWebVR' in window)) forceWebVR = false;

if(!nativeWebXR && !forceWebVR) {
    try {
        polyfill = new WebXRPolyfill();
    } catch (e) {
        console.error('[ca-shim] WebXR polyfill failed.', e);
    }
} else if(forceWebVR != undefined && forceWebVR) {
    console.warning('[ca-shim] WebVR was forced, not polyfilling WebXR');
}


var versionShim;
try {
    versionShim = new WebXRVersionShim();
} catch (e) {
    console.error('[ca-shim] Version shim application failed.', e);
}

/* Prevent re-polyfilling and shimming */
WebXRPolyfill.prototype.WebXRPolyfill = function(){ return polyfill; };
WebXRVersionShim.prototype.WebXRVersionShim = function(){ return versionShim; };

function onError(e) {
    console.error("[ca-shim] Error: " + e.message);
}

var framework = null;
function enterVR() {
    if(framework == 'aframe' || framework == 'aframe-embedded') {
        var scene = document.querySelector('a-scene');
        if(!scene) {
            var iframe = document.querySelector('iframe');
            scene = iframe.contentDocument.querySelector('a-scene');
        }
        scene.enterVR();
    } else if(framework == 'unity') {
        var iframe = document.querySelector('iframe');
        frame.contentWindow.vrManager.requestPresent(iframe.contentWindow.vrManager.canvas);
    } else if(framework == 'magnum') {
        var iframe = document.querySelector('iframe');
        iframe.contentWindow.Module.webxr_request_session();
    } else if(framework == 'jocly') {
        /* Jocly xd-view sets up the VR button click listeners for entering
         * and exiting VR. As there seems to be no way of getting the context
         * or VR device of the game, we simply simulate click on the hidden VR
         * button */
        var elements = joclyGame.iframe.contentDocument.getElementsByClassName('vr-button');
        for(let e of elements) e.click();
    }
};

function exitVR() {
    if(framework == 'aframe') {
        var scene = document.querySelector('a-scene');
        if(!scene) {
            scene = document.querySelector('iframe')
                .contentDocument
                .querySelector('a-scene');
        }
        scene.exitVR();
        onSessionEnd(undefined);
    } else if(framework == 'unity') {
        var iframe = document.querySelector('iframe');
        iframe.contentWindow.vrManager.exitPresent();
        onSessionEnd(undefined);
    } else if(framework == 'magnum') {
        var iframe = document.querySelector('iframe');
        var session = iframe.contentWindow.Module['webxr_session'];
        if(session) session.end();
    } else if(framework == 'jocly') {
        /* Jocly xd-view sets up the VR button click listeners for entering
         * and exiting VR. As there seems to be no way of getting the context
         * or VR device of the game, we simply simulate click on the hidden VR
         * button */
        var elements = joclyGame.iframe.contentDocument.getElementsByClassName('vr-button');
        for(let e of elements) e.click();
    } else {
        if(display == null) {
            onSessionEnd(undefined);
        } else {
            display.exitPresent().then(onSessionEnd).catch(onError);
        }
    }
};

function shim(n, w) {
    if(!('xr' in n)) {
        console.log('[ca-shim] No WebXR support.');
        window.dispatchEvent(new Event('xrnosupport'));

    } else if(nativeWebXR) {
        console.log('[ca-shim] Native WebXR support.');

        if(!('requestDevice' in n.xr)) {
            n.xr.requestDevice = function(params) {
                return new Promise(function(resolve, reject) {
                    resolve({
                        requestSession: function(p) {
                            /* A-Frame wants to use WebVR after WebXR failed on Chrome,
                               which Chrome does not allow with DOMException.
                               So we'll act as if it's not supported after using WebXR */
                            n.getVRDisplays = undefined;
                            return n.xr.requestSession(p);
                            //return n.xr.requestSession({mode: 'immersive-vr'});
                        },
                        supportsSession: function(p) {
                            /* A-Frame wants to use WebVR after WebXR failed on Chrome,
                               which Chrome does not allow with DOMException.
                               So we'll act as if it's not supported after using WebXR */
                            n.getVRDisplays = undefined;
                            return n.xr.supportsSessionMode('immersive-vr');
                        }
                    });
                });
            };
        }

        if('XRDevice' in w) {
            /* Shim WebXR Device API -- obsolete, XRDevice has been removed from the spec */
            const NATIVE_SUPPORTS_SESSION = XRDevice.prototype.supportsSession;
            XRDevice.prototype.supportsSession = function(params) {
                return NATIVE_SUPPORTS_SESSION.call(this, params)
                    .then(onSessionSupported, onNoDeviceAvailable)
                    .catch(onError);
            };
            const NATIVE_REQUEST_SESSION = XRDevice.prototype.requestSession;
            XRDevice.prototype.requestSession = function(params) {
                /* Chrome 69 passes undefined to the second then handler.
                   We manually resolve a new promise with the initial session */
                var original = NATIVE_REQUEST_SESSION.call(this, params);
                var chained = new Promise(function(resolve, reject) {
                    original
                        .then(function(s) {
                            onSessionStart(s);
                            resolve(s);
                        }, function(e) {
                            reject(e);
                        })
                        .catch(onError)
                });
                return chained;
            };

            n.xr.requestDevice()
                .then(function(device) {
                    device.supportsSession({immersive: true})
                        .catch(onNoDeviceAvailable);
                }, onNoDeviceAvailable)
                .catch(onNoDeviceAvailable);
        } else {
            console.log('[ca-shim] Polyfilling XRDevice');

            /* Shim WebXR Device API */
            if('supportsSessionMode' in n.xr) {
                console.log('[ca-shim] shimming supportsSessionMode');
                const NATIVE_SUPPORTS_SESSION_MODE = n.xr.supportsSessionMode;
                n.xr.supportsSessionMode = function(params) {
                    var original = NATIVE_SUPPORTS_SESSION_MODE.call(n.xr, params);
                    return new Promise(function(resolve, reject) {
                        original.then(function() {
                            onSessionSupported()
                            resolve();
                        }, function(e) {
                            onNoDeviceAvailable(e);
                            reject(e);
                        })
                        .catch(function(e) {
                            onError(e);
                            reject(e.message);
                        });
                    });
                };

                /*
                n.xr.supportsSessionMode('immersive-vr')
                    .then(function() {}, onNoDeviceAvailable)
                    .catch(onNoDeviceAvailable); */
            } else {
                console.log('[ca-shim] shimming supportsSession');
                const NATIVE_SUPPORTS_SESSION = n.xr.supportsSession;
                n.xr.supportsSession = function(params) {
                    return NATIVE_SUPPORTS_SESSION.call(n.xr, params)
                        .then(onSessionSupported, onNoDeviceAvailable);
                };
            }

            console.log('[ca-shim] shimming requestSession');
            const NATIVE_REQUEST_SESSION = n.xr.requestSession;
            n.xr.requestSession = function(params) {
                /* Chrome 69 passes undefined to the second then handler.
                * We manually resolve a new promise with the initial session */
                var original = NATIVE_REQUEST_SESSION.call(n.xr, params);
                var chained = new Promise(function(resolve, reject) {
                    original
                        .then(function(s) {
                            onSessionStart(s);
                            resolve(s);
                        }, function(e) {
                            reject(e);
                        })
                        .catch(onError);
                });
                return chained;
            };

            console.log('[ca-shim] shimming getContext to always be XR compatible');
            const NATIVE_CANVAS_GET_CONTEXT = w.HTMLCanvasElement.prototype.getContext;
            w.HTMLCanvasElement.prototype.getContext = function(ctx, params) {
                if(!params) params = {};
                params.xrCompatible = true;
                var context = NATIVE_CANVAS_GET_CONTEXT.call(this, ctx, params);
                context.setCompatibleXRDevice = (d) => { return Promise.resolve(); };
                return context;
            };

            if('requestReferenceSpace' in XRSession.prototype) {
                console.log('[ca-shim] filling requestFrameOfReference');
                XRSession.prototype.requestFrameOfReference = function(type) {
                    if(type == 'stage') type = 'floor-level';
                    return this.requestReferenceSpace({
                        type: 'stationary',
                        subtype: type
                    });
                };
            }

            if('getViewerPose' in XRFrame.prototype) {
                console.log('[ca-shim] filling XRFrame.getDevicePose');
                XRFrame.prototype.getDevicePose = function(refSpace) {
                    pose = this.getViewerPose(refSpace);
                    this.views = pose.views; /* XRFrame.views */
                    return pose;
                }
            }

            if('transform' in XRView) {
                console.log('[ca-shim] filling XRViewerPose.getViewMatrix');
                XRViewerPose.prototype.getViewMatrix = function(view) {
                    return view.transform.inverse().matrix;
                };
            } else {
                console.log('[ca-shim] filling XRViewerPose.getViewMatrix');
                XRViewerPose.prototype.getViewMatrix = function(view) {
                    return view.viewMatrix;
                };
            }

            /* Version shim requestDevice() for older A-Frame versions */
            w.XRDevice = class XRDevice {};
        }

        /* For the jocly games */
        if(!('resetPose' in VRDisplay.prototype)) {
            console.log('[ca-shim] filling VRDisplay.resetPose');
            VRDisplay.prototype.resetPose = function() {};
        }

    } else {
        console.log('[ca-shim] Polyfilled WebXR support.');

        /* Shim WebVR 1.1 API */
        const NATIVE_REQUEST_PRESENT = VRDisplay.prototype.requestPresent;
        VRDisplay.prototype.requestPresent = function(layers) {
            return NATIVE_REQUEST_PRESENT.call(this, layers)
                .then(onSessionStart)
                .catch(onError);
        };

        const NATIVE_GET_VR_DISPLAYS = n.getVRDisplays;
        n.getVRDisplays = function() {
            if(displays) {
                return Promise.resolve(displays);
            }
            return new Promise(function(resolve, reject) {
                NATIVE_GET_VR_DISPLAYS.call(n)
                    .then(function(d) {
                        displays = displays || d;

                        if (d.length > 0) {
                            display = d[0];
                            gtag('event', 'xr_session', {'xr_device': d[0].displayName});
                            onSessionSupported();
                        } else if (display == null) {
                            onNoDeviceAvailable('No Device Available');
                        }
                        resolve(displays);
                    }, function(err) {
                        onNoDeviceAvailable(err);
                        reject(err);
                    })
                    .catch(function(e) {
                        if(e && e.code === 11) {
                            /* XR API already in use, just reject */
                            reject();
                            return;
                        }
                    });
            });
        }
    }
}

shim(navigator, window);

var iframe = document.querySelector('iframe');
if(iframe) {
    shim(navigator, iframe.contentWindow);
}

function onSessionEnd(s) {
    // s may be null!
    if(lastSessionStart) {
        gtag('event', 'xr_session_ended', {'xr_session_duration': (new Date() - lastSessionStart)/1000});
    } else {
        gtag('event', 'xr_session_ended', {});
    }
    window.dispatchEvent(new Event('xrsessionend', {detail: {session: session}}));
    if(window.parent && window.parent != window) {
        window.parent.dispatchEvent(new Event('xrsessionend', {detail: {session: session}}));
    }
    session = null;
};

function onSessionStart(e) {
    // s may be null! (or undefined even)
    var firstSession = (lastSessionStart == null);
    lastSessionStart = new Date();
    if(firstSession) gtag('event', 'xr_session_started',
        {'xr_first_session_start': (lastSessionStart - pageLoad)/1000});
    session = (e && e.detail) ? e.detail.session : null;
    if(session) session.addEventListener('end', onSessionEnd);

    /* Dispatch session start event */
    window.dispatchEvent(new Event('xrsessionstart', {detail: {session: session}}));
    if(window.parent && window.parent != window) {
        window.parent.dispatchEvent(new Event('xrsessionstart', {detail: {session: session}}));
    }
    window.addEventListener('beforeunload', onSessionEnd);
};

var onNoDeviceAvailable = function() {
    var b = false;
    return function(error) {
        if(!b) {
            b = true;
            gtag('event', 'xr_session', {'xr_has_device': false});
        }
        window.dispatchEvent(new Event('xrnodevice'));
    };
}();

var onSessionSupported = function() {
    var b = false;
    return function() {
        if(!b) {
            b = true;
            gtag('event', 'xr_session', {'xr_has_device': true});
        }

        window.dispatchEvent(new Event('xrsessionsupported'));
    };
}();

/* Test */
window.addEventListener('xrsessionstart', () => console.log('[ca-shim] xrsessionstart'));
window.addEventListener('xrsessionend', () => console.log('[ca-shim] xrsessionend'));
window.addEventListener('xrsessionsupported', () => console.log('[ca-shim] x rsessionsupported'));
window.addEventListener('xrnosupport', () => console.log('[ca-shim] xrnosupport'));
window.addEventListener('xrnodevice', () => console.log('[ca-shim] xrnodevice'));
