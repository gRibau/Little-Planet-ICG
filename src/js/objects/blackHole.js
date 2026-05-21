import * as THREE from 'three';

export function createBlackHole() {
    const blackHole = new THREE.Group();

    const singularityMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 1,
        metalness: 0
    });

    const accretionMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8a1f,
        emissive: 0xff4f00,
        emissiveIntensity: 1.4,
        roughness: 0.55,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72
    });

    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffc06b,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
    });

    const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 48), singularityMaterial);
    blackHole.add(core);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.07, 0.47, 24, 120), glowMaterial);

    innerRing.scale.z = 0.3;

    innerRing.rotation.x = Math.PI / 2;
    innerRing.rotation.z = -Math.PI * 0.08;
    blackHole.add(innerRing);

    const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.7, 48, 48), glowMaterial);
    blackHole.add(innerSphere);

    const halo = new THREE.Mesh(new THREE.SphereGeometry(3.55, 48, 48), glowMaterial);
    halo.scale.set(1.15, 0.05, 1.15);
    blackHole.add(halo); 

    const haloSphere = new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), glowMaterial);
    blackHole.add(haloSphere);

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.34, 24, 96), accretionMaterial);

    outerRing.scale.z = 0.3;

    outerRing.rotation.x = Math.PI / 2;
    outerRing.rotation.z = Math.PI * 0.12;
    blackHole.add(outerRing);

    const outerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 48, 48), accretionMaterial);
    blackHole.add(outerSphere);

    const pointLight = new THREE.PointLight(0xff7a18, 8, 35);
    pointLight.position.set(0, 0, 0);
    blackHole.add(pointLight);

    blackHole.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return blackHole;
}