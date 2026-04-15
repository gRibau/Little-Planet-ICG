import * as THREE from 'three';

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
