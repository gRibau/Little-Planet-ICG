import * as THREE from 'three';

export function createBlackHole() {
    const blackHole = new THREE.Group();

    // 1. Core Material
    const singularityMaterial = new THREE.MeshStandardMaterial({
        color: 0x050505,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 1,
        depthTest: true,
        depthWrite: true,
        stencilWrite: true,
        stencilRef: 1,
        stencilZPass: THREE.ReplaceStencilOp
    });

    // 2. Sphere Materials
    const accretionSphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8a1f,
        emissive: 0xff4f00,
        emissiveIntensity: 1.4,
        roughness: 0.55,
        metalness: 0.15,
        transparent: true,
        opacity: 0.72,
        depthTest: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.NotEqualStencilFunc
    });

    const glowSphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffc06b,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.NotEqualStencilFunc
    });

    // 3. Ring Materials
    // Fix: depthWrite is false so they do not block each other
    // They still write to the stencil buffer to mask the background
    const accretionRingMaterial = accretionSphereMaterial.clone();
    accretionRingMaterial.depthTest = true;
    accretionRingMaterial.depthWrite = false; 
    accretionRingMaterial.stencilFunc = THREE.AlwaysStencilFunc; 
    accretionRingMaterial.stencilZPass = THREE.ReplaceStencilOp;

    const glowRingMaterial = glowSphereMaterial.clone();
    glowRingMaterial.depthTest = true;
    glowRingMaterial.depthWrite = false;
    glowRingMaterial.stencilFunc = THREE.AlwaysStencilFunc;
    glowRingMaterial.stencilZPass = THREE.ReplaceStencilOp;

    // Foreground rendering
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 48), singularityMaterial);
    core.renderOrder = 1;
    blackHole.add(core);

    const halo = new THREE.Mesh(new THREE.SphereGeometry(3.55, 48, 48), glowRingMaterial);
    halo.scale.set(1.15, 0.05, 1.15);
    halo.renderOrder = 1;
    blackHole.add(halo); 

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.07, 0.47, 24, 120), glowRingMaterial);
    innerRing.scale.z = 0.3;
    innerRing.rotation.x = Math.PI / 2;
    innerRing.rotation.z = Math.PI * 0.08;
    innerRing.renderOrder = 1;
    blackHole.add(innerRing);

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.75, 0.34, 24, 96), accretionRingMaterial);
    outerRing.scale.z = 0.3;
    outerRing.rotation.x = Math.PI / 2;
    outerRing.rotation.z = Math.PI * 0.12;
    outerRing.renderOrder = 1;
    blackHole.add(outerRing);

    // Background rendering
    const outerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 48, 48), accretionSphereMaterial);
    outerSphere.renderOrder = 2;
    blackHole.add(outerSphere);

    const haloSphere = new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), glowSphereMaterial);
    haloSphere.renderOrder = 3;
    blackHole.add(haloSphere);

    const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.7, 48, 48), glowSphereMaterial);
    innerSphere.renderOrder = 4;
    blackHole.add(innerSphere);

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