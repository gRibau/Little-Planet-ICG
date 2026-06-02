import * as THREE from 'three';

const _planeBox = new THREE.Box3();
const _cityBox = new THREE.Box3();
const _cityWorldPos = new THREE.Vector3();
let _isCrashing = false;

// Preload the image so it's instantly available in memory when needed
const preloadedCrashImg = new Image();
preloadedCrashImg.src = 'assets/images/no_signal.png';

function triggerPlaneCrash(planeInteraction) {
    if (_isCrashing) return;
    _isCrashing = true;

    // Show "no signal" image instantly using the preloaded image element
    const crashImg = preloadedCrashImg.cloneNode();
    crashImg.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        object-fit: cover; z-index: 9999; pointer-events: none;
        opacity: 1; transition: opacity 0.5s ease-in-out;
        background-color: black; /* Fills instantly if image decoding is delayed */
    `;
    document.body.appendChild(crashImg);

    // Delay the environment reset by just a tiny bit (50ms) to guarantee
    // the browser has painted the black background/image over the screen first.
    setTimeout(() => {
        planeInteraction.setPlaneSelection(false);
    }, 50);

    // Fade out after 1.5 seconds, remove after 2
    setTimeout(() => {
        crashImg.style.opacity = '0';
        setTimeout(() => {
            crashImg.remove();
            _isCrashing = false;
        }, 500);
    }, 2000);
}

export function updatePlaneCrashCheck(planeInteraction, plane, city) {
    if (planeInteraction.isPlaneSelected() && !_isCrashing) {
        city.getWorldPosition(_cityWorldPos);
        // Fast distance check before expensive bounding box check (12 units squared = 144)
        if (plane.position.distanceToSquared(_cityWorldPos) < 144) {
            _planeBox.setFromObject(plane);
            _cityBox.setFromObject(city);
            if (_planeBox.intersectsBox(_cityBox)) {
                triggerPlaneCrash(planeInteraction);
            }
        }
    }
}
