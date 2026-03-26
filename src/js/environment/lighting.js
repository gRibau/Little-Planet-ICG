import * as THREE from 'three';

export function setupLighting(scene) {
    // Sun (Directional Light)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2);
    sunLight.position.set(10, 10, 10);
    scene.add(sunLight);

    // Ambient light for general visibility (probably wont add)
    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // scene.add(ambientLight);

    // return { sunLight, ambientLight };

    return sunLight;
}
