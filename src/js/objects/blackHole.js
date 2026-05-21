import * as THREE from 'three';

export function createBlackHole() {
    const blackHole = new THREE.Group();

    // 1. Core Material
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
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
    const outerSphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8a1f,
        emissive: 0xff4f00,
        emissiveIntensity: 1.4,
        roughness: 0.55,
        metalness: 0.15,
        transparent: true,
        opacity: 1,
        depthTest: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.NotEqualStencilFunc
    });

    const haloSphereMaterial = outerSphereMaterial.clone();
    haloSphereMaterial.color.set(0xFFD487);

    const innerSphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFE1AB,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
        stencilWrite: true,
        stencilRef: 1,
        stencilFunc: THREE.NotEqualStencilFunc
    });

    // 3. Ring Materials
    const outerRingMaterial = outerSphereMaterial.clone();
    outerRingMaterial.depthTest = true;
    outerRingMaterial.depthWrite = false; 
    outerRingMaterial.stencilFunc = THREE.AlwaysStencilFunc; 
    outerRingMaterial.stencilZPass = THREE.ReplaceStencilOp;

    const haloRingMaterial = haloSphereMaterial.clone();
    haloRingMaterial.depthTest = true;
    haloRingMaterial.depthWrite = false; 
    haloRingMaterial.stencilFunc = THREE.AlwaysStencilFunc; 
    haloRingMaterial.stencilZPass = THREE.ReplaceStencilOp;

    const innerRingMaterial = innerSphereMaterial.clone();
    innerRingMaterial.depthTest = true;
    innerRingMaterial.depthWrite = false;
    innerRingMaterial.stencilFunc = THREE.AlwaysStencilFunc;
    innerRingMaterial.stencilZPass = THREE.ReplaceStencilOp;

    // Foreground rendering
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 48), coreMaterial);
    core.renderOrder = 1;
    blackHole.add(core);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.6, 24, 96), innerRingMaterial);
    innerRing.scale.z = 0.1;
    innerRing.rotation.x = Math.PI / 2;
    innerRing.rotation.z = Math.PI * 0.08;
    innerRing.renderOrder = 1;
    blackHole.add(innerRing);

    const halo = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.5, 24, 96), haloRingMaterial);
    halo.scale.z = 0.1;
    halo.rotation.x = Math.PI / 2;
    halo.rotation.z = Math.PI * 0.08;
    halo.renderOrder = 1;
    blackHole.add(halo); 

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.4, 24, 96), outerRingMaterial);
    outerRing.scale.z = 0.1;
    outerRing.rotation.x = Math.PI / 2;
    outerRing.rotation.z = Math.PI * 0.08;
    outerRing.renderOrder = 1;
    blackHole.add(outerRing);

    // Background rendering
    const outerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 48, 48), outerSphereMaterial);
    outerSphere.renderOrder = 2;
    blackHole.add(outerSphere);

    const haloSphere = new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), haloSphereMaterial);
    haloSphere.renderOrder = 3;
    blackHole.add(haloSphere);

    const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.7, 48, 48), innerSphereMaterial);
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