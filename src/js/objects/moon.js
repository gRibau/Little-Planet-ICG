import * as THREE from 'three';

const _placementSurfaceNormal = new THREE.Vector3();
const _placementYawQuat = new THREE.Quaternion();

export function placeModelOnMoon(model, moon, options = {}) {
    const {
        latitudeDeg = 0,
        longitudeDeg = 0,
        radius = 7,
        altitude = 0,
        yawDeg = 0,
        alignToNormal = true
    } = options;

    const lat = THREE.MathUtils.degToRad(latitudeDeg);
    const lon = THREE.MathUtils.degToRad(longitudeDeg);

    _placementSurfaceNormal.set(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon)
    ).normalize();

    model.position.copy(_placementSurfaceNormal).multiplyScalar(radius + altitude);

    if (alignToNormal) {
        model.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _placementSurfaceNormal);
    }

    if (yawDeg !== 0) {
        _placementYawQuat.setFromAxisAngle(_placementSurfaceNormal, THREE.MathUtils.degToRad(yawDeg));
        model.quaternion.premultiply(_placementYawQuat);
    }

    if (model.parent !== moon) {
        moon.add(model);
    }
}

export function createMoon() {
    const geometry = new THREE.SphereGeometry(7, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const moon = new THREE.Mesh(geometry, material);
    
    moon.castShadow = true;
    moon.receiveShadow = true;
    
    // Starting position relative to Earth
    moon.position.set(60, 0, 0); 
    
    return moon;
}
