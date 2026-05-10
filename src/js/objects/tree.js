import * as THREE from 'three';

export function createTree() {
    const tree = new THREE.Group();

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x6b4a2b,
        roughness: 0.9,
        metalness: 0.02
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f7d3b,
        roughness: 0.8,
        metalness: 0.02
    });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.6, 10), trunkMaterial);
    trunk.position.y = 0.8;
    tree.add(trunk);

    const foliageBase = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.4, 12), leafMaterial);
    foliageBase.position.y = 1.9;
    tree.add(foliageBase);

    const foliageTop = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.0, 12), leafMaterial);
    foliageTop.position.y = 2.6;
    tree.add(foliageTop);

    tree.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return tree;
}
