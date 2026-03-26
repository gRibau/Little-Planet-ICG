import * as THREE from 'three';

export function setupSkybox(scene, texturePath) {
    const textureLoader = new THREE.TextureLoader();
    
    textureLoader.load(texturePath, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        
        // Create a massive sphere to act as the skybox
        const geometry = new THREE.SphereGeometry(1000, 64, 32);
        
        // Invert the geometry so the texture faces inward
        geometry.scale(-1, 1, 1);
        
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide // Ensure it's visible from inside
        });
        
        const skybox = new THREE.Mesh(geometry, material);
        scene.add(skybox);
        
        // Set as environment so the planet reflects the stars
        scene.environment = texture;
    });
}
