import * as THREE from 'three';

const _modelWorldPos = new THREE.Vector3();
const _planetWorldPos = new THREE.Vector3();
const _sunWorldPos = new THREE.Vector3();
const _surfaceNormal = new THREE.Vector3();
const _toSun = new THREE.Vector3();
const _lightColor = new THREE.Color();
const _darkColor = new THREE.Color();
const _currentColor = new THREE.Color();
const _lightEmissive = new THREE.Color();
const _darkEmissive = new THREE.Color();
const _currentEmissive = new THREE.Color();

export function updateModelWindowLighting(model, planet, sun, options = {}) {
    const windows = model?.userData?.windows;
    if (!windows?.length || !planet || !sun) {
        return;
    }

    const defaults = model.userData.windowLighting ?? {};
    const {
        lightColor = defaults.lightColor ?? 0x4f80ff,
        lightEmissive = defaults.lightEmissive ?? 0x163a92,
        lightIntensity = defaults.lightIntensity ?? 0.85,
        darkColor = defaults.darkColor ?? 0xffd45a,
        darkEmissive = defaults.darkEmissive ?? 0xffd04d,
        darkIntensity = defaults.darkIntensity ?? 1.0,
        shadowThreshold = defaults.shadowThreshold ?? 0,
        darkReach = defaults.darkReach ?? 1 / 3,
        transitionSpeed = defaults.transitionSpeed ?? 1.2,
        deltaTime = options.deltaTime ?? 1 / 60
    } = options;

    model.getWorldPosition(_modelWorldPos);
    planet.getWorldPosition(_planetWorldPos);
    sun.getWorldPosition(_sunWorldPos);

    _surfaceNormal.copy(_modelWorldPos).sub(_planetWorldPos).normalize();
    _toSun.copy(_sunWorldPos).sub(_modelWorldPos).normalize();

    const sunDot = _surfaceNormal.dot(_toSun);
    const targetBlend = THREE.MathUtils.clamp((shadowThreshold - sunDot) / darkReach, 0, 1);

    if (!model.userData.windowLightingState) {
        model.userData.windowLightingState = { blend: targetBlend };
    }

    const lightingState = model.userData.windowLightingState;
    const t = 1 - Math.exp(-transitionSpeed * deltaTime);
    lightingState.blend = THREE.MathUtils.lerp(lightingState.blend, targetBlend, t);

    _lightColor.setHex(lightColor);
    _darkColor.setHex(darkColor);
    _currentColor.lerpColors(_lightColor, _darkColor, lightingState.blend);

    _lightEmissive.setHex(lightEmissive);
    _darkEmissive.setHex(darkEmissive);
    _currentEmissive.lerpColors(_lightEmissive, _darkEmissive, lightingState.blend);

    const targetIntensity = THREE.MathUtils.lerp(lightIntensity, darkIntensity, lightingState.blend);

    for (const windowPane of windows) {
        if (!windowPane?.material) {
            continue;
        }
        windowPane.material.color.copy(_currentColor);
        windowPane.material.emissive.copy(_currentEmissive);
        windowPane.material.emissiveIntensity = targetIntensity;
    }
}

export function updateModelsWindowLighting(models, planet, sun, options = {}) {
    if (!models?.length) {
        return;
    }

    for (const model of models) {
        updateModelWindowLighting(model, planet, sun, options);
    }
}
