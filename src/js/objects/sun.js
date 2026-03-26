import * as THREE from 'three';

export function createSun() {
    // Sun Geometry
    const geometry = new THREE.SphereGeometry(200, 100, 32);
    
    // Sun Material (Emissive so it "glows")
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        emissive: 0xffff00,
        emissiveIntensity: 2
    });

    const sun = new THREE.Mesh(geometry, material);
    
    // Position it at the same location as the light in lighting.js (10, 10, 10)
    sun.position.set(1100, 0, 1100);

    // Optional: Add a simple point light to make it look like it's emitting light locally
    const pointLight = new THREE.PointLight(0xffffff, 100, 100);
    sun.add(pointLight);

    return sun;
}
