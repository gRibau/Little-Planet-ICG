import * as THREE from 'three';

export function createPlanet() {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: 0x2244ff });
    const planet = new THREE.Mesh(geometry, material);
    return planet;
}
