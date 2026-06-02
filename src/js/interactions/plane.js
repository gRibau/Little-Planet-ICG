import * as THREE from 'three';
import { resetPlaneSpeed, updatePlaneControls } from '../animations/plane.js';

const followDistance = 25;
const followHeight = 5;
const followLerpSpeed = 24;
const recenterDuration = 0.35;

export function setupPlaneInteraction(camera, renderer, controls, planet, plane, interactionManager) {
    const cameraFollowTarget = new THREE.Vector3();
    const cameraLookAhead = new THREE.Vector3();
    const cameraQuatTarget = new THREE.Quaternion();
    const cameraBasis = new THREE.Matrix4();
    const worldOffset = new THREE.Vector3();
    const planeForwardDir = new THREE.Vector3();
    const radialUpDir = new THREE.Vector3();
    const cameraRightDir = new THREE.Vector3();
    const cameraUpDir = new THREE.Vector3();
    const cameraBackDir = new THREE.Vector3();
    const projectedForward = new THREE.Vector3();
    const recenterStartPosition = new THREE.Vector3();
    const recenterEndPosition = new THREE.Vector3();
    const recenterStartTarget = new THREE.Vector3();
    const recenterEndTarget = new THREE.Vector3();
    const defaultCameraOffset = camera.position.clone().sub(controls.target);
    const keyState = {
        KeyW: false,
        KeyA: false,
        KeyS: false,
        KeyD: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    const mobileState = {
        accelerate: false,
        brake: false,
        turnLeft: false,
        turnRight: false,
        dip: false,
        rise: false,
        tiltLeft: false,
        tiltRight: false
    };
    
    function isMobile() {
        return window.matchMedia("(pointer: coarse)").matches || ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.innerWidth <= 768;
    }
    
    let mobileControlsOverlay = document.createElement('div');
    mobileControlsOverlay.style.cssText = `
        position: fixed; bottom: 30px; left: 0; width: 100vw; 
        display: none; justify-content: space-between; padding: 0 20px;
        box-sizing: border-box; z-index: 1000; opacity: 0; transition: opacity 0.3s;
        user-select: none; pointer-events: none;
    `;
    
    function createDPad(layout) {
            const pad = document.createElement('div');
            pad.style.cssText = `
                display: grid; grid-template-columns: repeat(3, 50px); grid-template-rows: repeat(3, 50px);
                gap: 5px; pointer-events: auto;
            `;
            
            layout.forEach(btn => {
                const b = document.createElement('div');
                b.style.cssText = `
                    grid-column: ${btn.col}; grid-row: ${btn.row};
                    background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4);
                    border-radius: 8px; display: flex; justify-content: center; align-items: center;
                    color: white; font-size: 24px; font-weight: bold; backdrop-filter: blur(4px);
                    -webkit-user-select: none; user-select: none;
                `;
                b.innerText = btn.icon;
                
                const press = (e) => { e.preventDefault(); e.stopPropagation(); mobileState[btn.action] = true; b.style.background = 'rgba(255, 255, 255, 0.5)'; };
                const release = (e) => { e.preventDefault(); e.stopPropagation(); mobileState[btn.action] = false; b.style.background = 'rgba(255, 255, 255, 0.2)'; };
                
                b.addEventListener('pointerdown', press, {passive: false});
                b.addEventListener('pointerup', release, {passive: false});
                b.addEventListener('pointercancel', release, {passive: false});
                b.addEventListener('pointerleave', release, {passive: false});
                
                b.addEventListener('touchstart', press, {passive: false});
                b.addEventListener('touchend', release, {passive: false});
                b.addEventListener('touchcancel', release, {passive: false});
                
                pad.appendChild(b);
            });
            return pad;
        }

        const leftPad = createDPad([
            { col: 2, row: 1, action: 'accelerate', icon: '⏶' },
            { col: 1, row: 2, action: 'turnLeft', icon: '⏴' },
            { col: 3, row: 2, action: 'turnRight', icon: '⏵' },
            { col: 2, row: 3, action: 'brake', icon: '⏷' }
        ]);

        const rightPad = createDPad([
            { col: 2, row: 1, action: 'dip', icon: '⏶' },
            { col: 1, row: 2, action: 'tiltLeft', icon: '⏴' },
            { col: 3, row: 2, action: 'tiltRight', icon: '⏵' },
            { col: 2, row: 3, action: 'rise', icon: '⏷' }
        ]);

    mobileControlsOverlay.appendChild(leftPad);
    mobileControlsOverlay.appendChild(rightPad);
    document.body.appendChild(mobileControlsOverlay);

    let planeSelected = false;
    let recenterElapsed = recenterDuration;

    const controlsOverlay = document.createElement('div');
    controlsOverlay.style.position = 'fixed';
    controlsOverlay.style.left = '16px';
    controlsOverlay.style.bottom = '16px';
    controlsOverlay.style.padding = '10px 12px';
    controlsOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
    controlsOverlay.style.color = '#ffffff';
    controlsOverlay.style.border = '1px solid rgba(255, 255, 255, 0.25)';
    controlsOverlay.style.borderRadius = '6px';
    controlsOverlay.style.fontFamily = 'monospace';
    controlsOverlay.style.fontSize = '12px';
    controlsOverlay.style.lineHeight = '1.4';
    controlsOverlay.style.display = 'none';
    controlsOverlay.style.whiteSpace = 'pre-line';
    controlsOverlay.textContent = 'Plane controls\nW: Faster\nS: Slower\nA: Turn left\nD: Turn right\nUp: Dip\nDown: Rise\nLeft: Tilt left\nRight: Tilt right';
    document.body.appendChild(controlsOverlay);

    function clearKeyState() {
        keyState.KeyW = false;
        keyState.KeyA = false;
        keyState.KeyS = false;
        keyState.KeyD = false;
        keyState.ArrowUp = false;
        keyState.ArrowDown = false;
        keyState.ArrowLeft = false;
        keyState.ArrowRight = false;
        if (isMobile()) {
            for (let k in mobileState) mobileState[k] = false;
        }
    }

    function setPlaneSelection(isSelected) {
        if (planeSelected === isSelected) {
            return;
        }

        planeSelected = isSelected;
        
        if (isMobile()) {
            controlsOverlay.style.display = 'none';
            if (planeSelected) {
                mobileControlsOverlay.style.display = 'flex';
                void mobileControlsOverlay.offsetWidth; // Trigger reflow
                mobileControlsOverlay.style.opacity = '0.6';
            } else {
                mobileControlsOverlay.style.opacity = '0';
                setTimeout(() => {
                    if (!planeSelected) mobileControlsOverlay.style.display = 'none';
                }, 300);
            }
        } else {
            mobileControlsOverlay.style.display = 'none';
            controlsOverlay.style.display = planeSelected ? 'block' : 'none';
        }
        
        controls.enabled = !isSelected;

        recenterStartPosition.copy(camera.position);
        recenterStartTarget.copy(controls.target);
        recenterEndTarget.copy(planet.position);
        recenterEndPosition.copy(planet.position).add(defaultCameraOffset);
        recenterElapsed = 0;

        if (!planeSelected) {
            clearKeyState();
            resetPlaneSpeed();
        }
    }

    interactionManager.add(plane, {
        useCursor: true,
        disableControls: true,
        onClick: (event) => {
            setPlaneSelection(true);
        },
        onClickMissed: (event) => {
            setPlaneSelection(false);
        }
    });

    function handleKeyDown(event) {
        if (!planeSelected) {
            return;
        }

        if (event.code in keyState) {
            keyState[event.code] = true;
            event.preventDefault();
        }
    }

    function handleKeyUp(event) {
        if (event.code in keyState) {
            keyState[event.code] = false;
            if (planeSelected) {
                event.preventDefault();
            }
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function updateFollowCamera(deltaTime) {
        if (!planeSelected || recenterElapsed < recenterDuration) {
            return;
        }

        const anchorPosition = plane.userData.cameraAnchorPosition ?? plane.position;
        const anchorQuaternion = plane.userData.cameraAnchorQuaternion ?? plane.quaternion;

        planeForwardDir.set(1, 0, 0).applyQuaternion(anchorQuaternion).normalize();
        radialUpDir.copy(anchorPosition).sub(planet.position).normalize();

        // Keep heading from plane but force camera up relative to planet to avoid roll-flips.
        projectedForward.copy(planeForwardDir)
            .addScaledVector(radialUpDir, -planeForwardDir.dot(radialUpDir));
        if (projectedForward.lengthSq() < 0.0001) {
            projectedForward.crossVectors(new THREE.Vector3(0, 1, 0), radialUpDir);
            if (projectedForward.lengthSq() < 0.0001) {
                projectedForward.crossVectors(new THREE.Vector3(1, 0, 0), radialUpDir);
            }
        }
        projectedForward.normalize();

        cameraRightDir.crossVectors(projectedForward, radialUpDir).normalize();
        cameraUpDir.crossVectors(cameraRightDir, projectedForward).normalize();
        cameraBackDir.copy(projectedForward).multiplyScalar(-1);

        worldOffset
            .copy(projectedForward).multiplyScalar(-followDistance)
            .addScaledVector(cameraUpDir, followHeight);
        cameraFollowTarget.copy(anchorPosition).add(worldOffset);
        cameraLookAhead.copy(anchorPosition).addScaledVector(projectedForward, 12);

        // Camera local +X/right, +Y/up, +Z/backward so that local -Z looks along plane forward.
        cameraBasis.makeBasis(cameraRightDir, cameraUpDir, cameraBackDir);
        cameraQuatTarget.setFromRotationMatrix(cameraBasis);

        const t = 1 - Math.exp(-followLerpSpeed * deltaTime);
        camera.position.lerp(cameraFollowTarget, t);
        camera.quaternion.copy(cameraQuatTarget);
        controls.target.copy(cameraLookAhead);
    }

    function updateRecenterCamera(deltaTime) {
        if (recenterElapsed >= recenterDuration) {
            return;
        }

        recenterElapsed = Math.min(recenterDuration, recenterElapsed + deltaTime);
        const t = recenterElapsed / recenterDuration;
        camera.position.lerpVectors(recenterStartPosition, recenterEndPosition, t);
        controls.target.lerpVectors(recenterStartTarget, recenterEndTarget, t);
    }

    return {
        isPlaneSelected: () => planeSelected,
        setPlaneSelection: (val) => setPlaneSelection(val),
        updateControls(deltaTime) {
            if (!planeSelected) {
                return;
            }

            const mobileActive = isMobile();
            updatePlaneControls(
                {
                    accelerate: keyState.KeyW || (mobileActive && mobileState.accelerate),
                    brake: keyState.KeyS || (mobileActive && mobileState.brake),
                    turnLeft: keyState.KeyA || (mobileActive && mobileState.turnLeft),
                    turnRight: keyState.KeyD || (mobileActive && mobileState.turnRight),
                    dip: keyState.ArrowUp || (mobileActive && mobileState.dip),
                    rise: keyState.ArrowDown || (mobileActive && mobileState.rise),
                    tiltLeft: keyState.ArrowLeft || (mobileActive && mobileState.tiltLeft),
                    tiltRight: keyState.ArrowRight || (mobileActive && mobileState.tiltRight)
                },
                deltaTime
            );
        },
        updateCamera(deltaTime) {
            updateRecenterCamera(deltaTime);
            updateFollowCamera(deltaTime);
        },
        dispose() {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            controlsOverlay.remove();
        }
    };
}
