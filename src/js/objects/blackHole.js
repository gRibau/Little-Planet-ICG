import * as THREE from 'three';

export function createBlackHole() {
    const blackHole = new THREE.Group();

    // 1. Core Material
    const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 1,
        depthTest: true,
        depthWrite: true,
        stencilWrite: true,
        stencilRef: 1,
        stencilZPass: THREE.ReplaceStencilOp
    });

    // 2. Sphere Materials
    const outerSphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8a1f,
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

    // 3. Ring Materials (Front Rings write to stencil to mask spheres)
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

    // 4. Back Ring Materials (do NOT write to stencil so spheres can draw over them)
    const backOuterRingMaterial = outerRingMaterial.clone();
    backOuterRingMaterial.stencilWrite = false;

    const backHaloRingMaterial = haloRingMaterial.clone();
    backHaloRingMaterial.stencilWrite = false;

    const backInnerRingMaterial = innerRingMaterial.clone();
    backInnerRingMaterial.stencilWrite = false;

    // Rings Setup
    const ringsContainer = new THREE.Group();
    ringsContainer.scale.z = 0.1;
    ringsContainer.rotation.x = Math.PI / 2;
    ringsContainer.rotation.z = Math.PI * 0.08;

    const frontRings = new THREE.Group();
    const backRings = new THREE.Group();
    ringsContainer.add(frontRings, backRings);
    blackHole.add(ringsContainer);

    // Front Rings (renderOrder 8 - drawn last, on top of everything)
    const frontInnerRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.6, 24, 96, Math.PI), innerRingMaterial);
    frontInnerRing.renderOrder = 8;
    frontRings.add(frontInnerRing);

    const frontHalo = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.5, 24, 96, Math.PI), haloRingMaterial);
    frontHalo.renderOrder = 8;
    frontRings.add(frontHalo);

    const frontOuterRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.4, 24, 96, Math.PI), outerRingMaterial);
    frontOuterRing.renderOrder = 8;
    frontRings.add(frontOuterRing);

    // Core (renderOrder 7)
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.6, 48, 48), coreMaterial);
    core.renderOrder = 7;
    blackHole.add(core);

    // Back Inner Ring (renderOrder 6 - uses non-stencil material)
    const backInnerRing = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.6, 24, 96, Math.PI), backInnerRingMaterial);
    backInnerRing.renderOrder = 6;
    backRings.add(backInnerRing);

    // Inner Sphere (renderOrder 5)
    const innerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.7, 48, 48), innerSphereMaterial);
    innerSphere.renderOrder = 5;
    blackHole.add(innerSphere);

    // Back Halo (renderOrder 4 - uses non-stencil material)
    const backHalo = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.5, 24, 96, Math.PI), backHaloRingMaterial);
    backHalo.renderOrder = 4;
    backRings.add(backHalo);

    // Halo Sphere (renderOrder 3)
    const haloSphere = new THREE.Mesh(new THREE.SphereGeometry(1.8, 48, 48), haloSphereMaterial);
    haloSphere.renderOrder = 3;
    blackHole.add(haloSphere);

    // Back Outer Ring (renderOrder 2 - uses non-stencil material)
    const backOuterRing = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.4, 24, 96, Math.PI), backOuterRingMaterial);
    backOuterRing.renderOrder = 2;
    backRings.add(backOuterRing);

    // Outer Sphere (renderOrder 1 - drawn first, background-most)
    const outerSphere = new THREE.Mesh(new THREE.SphereGeometry(1.9, 48, 48), outerSphereMaterial);
    outerSphere.renderOrder = 1;
    blackHole.add(outerSphere);

    // Dynamic rotation of rings
    core.onBeforeRender = function (renderer, scene, camera) {
        const camLocal = ringsContainer.worldToLocal(camera.position.clone());
        const angle = Math.atan2(camLocal.y, camLocal.x);
        frontRings.rotation.z = angle - Math.PI / 2;
        backRings.rotation.z = angle + Math.PI / 2;
    };

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