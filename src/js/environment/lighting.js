import * as THREE from 'three';

export function setupLighting(scene) {
    // Sun (Strong Point Light with low falloff)
    const sunLight = new THREE.PointLight(0xffffff, 80, 0, 0.5); 
    sunLight.position.set(100, 0, 100); 

    // Enable shadows for the light
    sunLight.castShadow = true;
    
    // Configure shadow map for PointLight
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 1000;

    scene.add(sunLight);

    // Ambient light for general visibility (probably wont add)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    return { sunLight, ambientLight };

    // return sunLight;
}
