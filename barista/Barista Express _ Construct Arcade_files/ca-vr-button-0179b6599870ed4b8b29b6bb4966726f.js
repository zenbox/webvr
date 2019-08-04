var vrInitialized = false;
var buttonLabel = "Loading";
var vrButtons = [];

function updateButtonLabel(newLabel) {
    console.log("[VR Button] New label: " + newLabel);
    buttonLabel = newLabel;

    vrButtons.forEach(function(e) {
        if(e) e.innerHTML = buttonLabel;
    })
}

var iframe = document.querySelector('iframe');
vrdoc = iframe ? iframe.documentWindow : document;
vrdoc.addEventListener('DOMContentLoaded', function () {
    var label = document.getElementById("vr-button-label");
    if(label) {
        console.log("Found VR button");
    } else {
        return;
    }
    vrButtons.push(label);
    /* Refresh button label */
    updateButtonLabel(buttonLabel);

    // User gesture to be allowed to request the session
    document.getElementById("vr-button").addEventListener('click', function() {
        if(buttonLabel == "Enter VR") {
            updateButtonLabel("Exit VR");
            enterVR();
        } else {
            exitVR();
        }
    });
});

/**
 * Initialize the VR button
 * @param fw Framework name
 **/
async function initVRButton(fw) {
    framework = fw;
    if(vrInitialized) {
        console.log("VR button already initialized");
        return;
    }
    vrInitialized = true;

    /* Automatically activate when display activates */
    window.addEventListener('vrdisplayactivate', function() {
        enterVR();
    });

    console.log("Initializing VR Button for " + framework);

    /* Provide casdk to iframe and shim webxr/vr there, too */
    if(iframe) {
        iframe.contentWindow.casdk = casdk;
    }
}

window.addEventListener('xrsessionend', function() { updateButtonLabel("Enter VR"); });
window.addEventListener('xrsessionsupported', function() { updateButtonLabel("Enter VR"); });

window.addEventListener('xrnodevice', function() {
    updateButtonLabel("(No VR Device)");

    var notice = document.getElementById("ca-notice");
    if(notice) {
        notice.innerHTML = '<i class="fa fa-warning"></i> The games on this site require a VR headset.'
    }
});

window.addEventListener('xrnosupport', function() {
    // Shimming failed aparatently, so even WebVR is not supported
    updateButtonLabel("WebVR/WebXR not supported");

    var notice = document.getElementById("ca-notice");
    if(notice) {
        notice.innerHTML = '<i class="fa fa-warning"></i> This website requires a browser that supports <a href="/vr-in-the-browser#in-development">WebVR</a>.'
    }
});

