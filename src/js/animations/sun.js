import * as THREE from 'three';

const _originalCameraPos = new THREE.Vector3();
const _zeroScale = new THREE.Vector3(0, 0, 0);

export function setupSunTransition(scene, camera, sun, blackHole, sunOffset, interactionManager, sunLight, ambientLight, consumableModels = []) {
    // Overlay for white flash
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'absolute';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100vw';
    flashOverlay.style.height = '100vh';
    flashOverlay.style.backgroundColor = 'white';
    flashOverlay.style.opacity = '0';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.transition = 'none'; // We'll control this manually
    document.body.appendChild(flashOverlay);
    
    const state = {
        clickStage: 0, // 0: none, 1: waiting, 2: animating, 3: consuming, 4: resetting, 5: done
        animationTimer: 0,
        isReplaced: false,
        flashOverlay: flashOverlay,
        scene: scene,
        camera: camera,
        sun: sun,
        blackHole: blackHole,
        sunOffset: sunOffset,
        sunLight: sunLight,
        ambientLight: ambientLight,
        consumableModels: consumableModels,
        consumableModelsData: [],
        originalSunLightColor: sunLight ? sunLight.color.getHex() : null,
        originalAmbientLightColor: ambientLight ? ambientLight.color.getHex() : null,
        originalAmbientLightIntensity: ambientLight ? ambientLight.intensity : null
    };

    interactionManager.add(sun, {
        useCursor: true,
        disableControls: false,
        onClick: (event) => {
            if (state.clickStage !== 0) return; // Prevent multiple clicks
            state.clickStage = 1;
            state.animationTimer = 0;
        }
    });

    return state;
}

export function updateSunTransition(state, deltaTime) {
    // Keep background elements centered around the camera.
    if (!state.isReplaced) {
        state.sun.position.copy(state.camera.position).add(state.sunOffset);
    } else {
        state.blackHole.position.copy(state.camera.position).add(state.sunOffset);
    }

    let originalCameraPos = null;
    if (state.clickStage === 1) {
        state.animationTimer += deltaTime;
        if (state.animationTimer >= 1.0) { // Wait 1 second
            state.clickStage = 2;
            state.animationTimer = 0;
        }
    } else if (state.clickStage === 2) {
        state.animationTimer += deltaTime;
        const animationDuration = 2.0; // 2 seconds total for the flash/shake
        const halfDuration = animationDuration / 2;

        if (state.animationTimer < animationDuration) {
            // Opacity goes 0 -> 1 -> 0
            let opacity = 0;
            if (state.animationTimer < halfDuration) {
                opacity = state.animationTimer / halfDuration;
            } else {
                opacity = 1.0 - ((state.animationTimer - halfDuration) / halfDuration);
            }
            state.flashOverlay.style.opacity = opacity.toString();

            // Shake intensity
            let shakeIntensity = opacity * 10.0; // Max 10 units of shake
            
            _originalCameraPos.copy(state.camera.position);
            originalCameraPos = _originalCameraPos;
            state.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
            state.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
            state.camera.position.z += (Math.random() - 0.5) * shakeIntensity;

            // Swap sun for black hole at the peak of the flash
            if (state.animationTimer >= halfDuration && !state.isReplaced) {
                state.scene.remove(state.sun);
                state.scene.add(state.blackHole);
                state.isReplaced = true;
                state.blackHole.position.copy(originalCameraPos).add(state.sunOffset);

                // Change lighting to slightly more orange
                if (state.sunLight) state.sunLight.color.setHex(0xffb87a);
                if (state.ambientLight) {
                    state.ambientLight.color.setHex(0xffb87a);
                    state.ambientLight.intensity = 0.2;
                }
            }
        } else {
            // Animation complete
            state.flashOverlay.style.opacity = '0';
            state.clickStage = 3; // Consuming
            state.animationTimer = 0;
            
            // Record initial positions for consuming
            state.consumableModelsData = state.consumableModels.map(model => ({
                model: model,
                startPos: model.position.clone(),
                startScale: model.scale.clone(),
                consumed: false
            }));
        }
    } else if (state.clickStage === 3) {
        state.animationTimer += deltaTime;
        const consumeDuration = 3.0; // Consume over 3 seconds

        // Interpolation factor
        const t = Math.min(state.animationTimer / consumeDuration, 1.0);
        // Ease-in so it starts slow and accelerates
        const easeInT = t * t * t;

        state.consumableModelsData.forEach(data => {
            if (data.consumed) return;
            
            // Move towards black hole
            data.model.position.lerpVectors(data.startPos, state.blackHole.position, easeInT);
            
            // Scale down
            data.model.scale.lerpVectors(data.startScale, _zeroScale, easeInT);

            if (t >= 1.0) {
                state.scene.remove(data.model);
                data.consumed = true;
            }
        });

        if (t >= 1.0) {
            state.clickStage = 4; // Reset animation
            state.animationTimer = 0;
        }
    } else if (state.clickStage === 4) {
        state.animationTimer += deltaTime;
        const animationDuration = 2.0; // 2 seconds total for the flash/shake
        const halfDuration = animationDuration / 2;

        if (state.animationTimer < animationDuration) {
            // Opacity goes 0 -> 1 -> 0
            let opacity = 0;
            if (state.animationTimer < halfDuration) {
                opacity = state.animationTimer / halfDuration;
            } else {
                opacity = 1.0 - ((state.animationTimer - halfDuration) / halfDuration);
            }
            state.flashOverlay.style.opacity = opacity.toString();

            // Shake intensity
            let shakeIntensity = opacity * 10.0; // Max 10 units of shake
            
            _originalCameraPos.copy(state.camera.position);
            originalCameraPos = _originalCameraPos;
            state.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
            state.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
            state.camera.position.z += (Math.random() - 0.5) * shakeIntensity;

            // Reset scene at the peak of the flash
            if (state.animationTimer >= halfDuration && state.isReplaced) {
                state.scene.remove(state.blackHole);
                state.scene.add(state.sun);
                state.isReplaced = false;

                // Restore lighting
                if (state.sunLight && state.originalSunLightColor !== null) {
                    state.sunLight.color.setHex(state.originalSunLightColor);
                }
                if (state.ambientLight && state.originalAmbientLightColor !== null && state.originalAmbientLightIntensity !== null) {
                    state.ambientLight.color.setHex(state.originalAmbientLightColor);
                    state.ambientLight.intensity = state.originalAmbientLightIntensity;
                }

                // Restore consumed models
                state.consumableModelsData.forEach(data => {
                    data.model.scale.copy(data.startScale);
                    data.model.position.copy(data.startPos);
                    state.scene.add(data.model);
                });
            }
        } else {
            // Reset complete
            state.flashOverlay.style.opacity = '0';
            state.clickStage = 0; // Ready for next click
            state.animationTimer = 0;
        }
    }

    return originalCameraPos;
}
