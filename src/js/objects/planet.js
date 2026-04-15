import * as THREE from 'three';

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
