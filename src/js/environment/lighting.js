import * as THREE from 'three';

export function setupLighting(scene) {
    // DirectionalLight is perfect for a Sun
    const sunLight = new THREE.DirectionalLight(0xffffff, 10); 
    
    // Position does not affect intensity, only the angle of the light and shadows
    sunLight.position.set(1100, 0, 1100); 

    // Enable shadows
    sunLight.castShadow = true;

    // Configure the shadow camera box to cover the planet and moon orbit
    const d = 150; 
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    
    // Make sure near and far planes cover the distance from the light to the objects
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 3000;

    // Improve shadow resolution
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;

    // Blur for the shadow edges, makes them smoother
    sunLight.shadow.radius = 8;
    
    // Ambient light for the dark side of the planet
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
    scene.add(sunLight);

    return { sunLight, ambientLight };
}
