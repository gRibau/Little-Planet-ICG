import * as THREE from 'three';

export function createPyramid() {
    const pyramid = new THREE.Group();

    const baseSize = 5.0;
    const height = 4.5;

    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0xb89c6a,
        roughness: 0.93,
        metalness: 0.02
    });

    const body = new THREE.Mesh(new THREE.ConeGeometry(baseSize, height, 4), stoneMaterial);
    body.rotation.y = Math.PI / 4;
    body.position.y = height / 2;
    pyramid.add(body);

    pyramid.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return pyramid;
}
