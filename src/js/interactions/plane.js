import * as THREE from 'three';
import { resetPlaneSpeed, updatePlaneControls } from '../animations/plane.js';

const followDistance = 25;
const followHeight = 5;
const followLerpSpeed = 24;
const recenterDuration = 0.35;

export function setupPlaneInteraction(camera, renderer, controls, planet, plane) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
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
        KeyD: false
    };

    let planeSelected = false;
    let hoveringPlane = false;
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
    controlsOverlay.textContent = 'Plane controls\nW: Faster\nS: Slower\nA: Turn left\nD: Turn right';
    document.body.appendChild(controlsOverlay);

    function clearKeyState() {
        keyState.KeyW = false;
        keyState.KeyA = false;
        keyState.KeyS = false;
        keyState.KeyD = false;
    }

    function setPlaneSelection(isSelected) {
        if (planeSelected === isSelected) {
            return;
        }

        planeSelected = isSelected;
        controlsOverlay.style.display = planeSelected ? 'block' : 'none';
        controls.enabled = !isSelected;
        controls.enableRotate = !isSelected && !hoveringPlane;

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

    function setHoveringPlane(isHovering) {
        hoveringPlane = isHovering;
        renderer.domElement.style.cursor = hoveringPlane ? 'pointer' : 'default';
        controls.enableRotate = !hoveringPlane;
    }

    function updatePointerFromEvent(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handlePointerDown(event) {
        updatePointerFromEvent(event);

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(plane, true);
        const clickedPlane = hits.length > 0;
        setPlaneSelection(clickedPlane);

        if (clickedPlane) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    function handlePointerMove(event) {
        updatePointerFromEvent(event);

        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(plane, true);
        setHoveringPlane(hits.length > 0);
    }

    function handlePointerLeave() {
        setHoveringPlane(false);
    }

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

    renderer.domElement.addEventListener('pointerdown', handlePointerDown, true);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function updateFollowCamera(deltaTime) {
        if (!planeSelected || recenterElapsed < recenterDuration) {
            return;
        }

        planeForwardDir.set(1, 0, 0).applyQuaternion(plane.quaternion).normalize();
        radialUpDir.copy(plane.position).sub(planet.position).normalize();

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
        cameraFollowTarget.copy(plane.position).add(worldOffset);
        cameraLookAhead.copy(plane.position).addScaledVector(projectedForward, 12);

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
        updateControls(deltaTime) {
            if (!planeSelected) {
                return;
            }

            updatePlaneControls(
                {
                    accelerate: keyState.KeyW,
                    brake: keyState.KeyS,
                    turnLeft: keyState.KeyA,
                    turnRight: keyState.KeyD
                },
                deltaTime
            );
        },
        updateCamera(deltaTime) {
            updateRecenterCamera(deltaTime);
            updateFollowCamera(deltaTime);
        },
        dispose() {
            renderer.domElement.removeEventListener('pointerdown', handlePointerDown, true);
            renderer.domElement.removeEventListener('pointermove', handlePointerMove);
            renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            renderer.domElement.style.cursor = 'default';
            controls.enableRotate = true;
            controlsOverlay.remove();
        }
    };
}
