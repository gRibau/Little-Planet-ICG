import * as THREE from 'three';

const _placementSurfaceNormal = new THREE.Vector3();
const _placementYawQuat = new THREE.Quaternion();

export function placeModelOnPlanet(model, planet, options = {}) {
    const {
        latitudeDeg = 0,
        longitudeDeg = 0,
        radius = 25,
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

    if (model.parent !== planet) {
        planet.add(model);
    }
}

export function createPlanet() {
    const textureLoader = new THREE.TextureLoader();
    const colorMap = textureLoader.load(new URL('../../assets/textures/planet_texture_v3.png', import.meta.url).href);
    const heightMap = textureLoader.load(new URL('../../assets/textures/planet_height_map_blur_v4.png', import.meta.url).href);

    colorMap.colorSpace = THREE.SRGBColorSpace;
    colorMap.minFilter = THREE.LinearMipmapLinearFilter;
    colorMap.magFilter = THREE.LinearFilter;
    colorMap.generateMipmaps = true;

    heightMap.minFilter = THREE.LinearMipmapLinearFilter;
    heightMap.magFilter = THREE.LinearFilter;
    heightMap.generateMipmaps = true;

    const geometry = new THREE.SphereGeometry(25, 160, 160);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: colorMap,
        displacementMap: heightMap,
        displacementScale: 2,
        displacementBias: -0.175
    });
    const planet = new THREE.Mesh(geometry, material);
    
    planet.castShadow = true;
    planet.receiveShadow = true;
    
    return planet;
}
