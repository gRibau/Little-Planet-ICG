import * as THREE from 'three';

const WINDOW_BLUE_COLOR = 0x4f80ff;
const WINDOW_BLUE_EMISSIVE = 0x163a92;

export function createMidrise() {
    const building = new THREE.Group();

    const bodyWidth = 3.0;
    const bodyDepth = 3.0;
    const bodyHeight = 8.2;

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3f3f3f,
        roughness: 0.78,
        metalness: 0.05
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x4d4d4d,
        roughness: 0.7,
        metalness: 0.08
    });

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: WINDOW_BLUE_COLOR,
        emissive: WINDOW_BLUE_EMISSIVE,
        emissiveIntensity: 0.85,
        roughness: 0.4,
        metalness: 0.05
    });

    const windowFrameMaterial = new THREE.MeshStandardMaterial({
        color: 0x1f1f1f,
        roughness: 0.75,
        metalness: 0.05
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth), bodyMaterial);
    body.position.y = bodyHeight / 2;
    building.add(body);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 2.4), accentMaterial);
    roof.position.y = bodyHeight + 0.45;
    building.add(roof);

    const windowGroup = new THREE.Group();
    const windows = [];

    const windowRows = 4;
    const windowCols = 2;
    const windowGapY = 1.6;
    const windowGapX = 0.85;
    const yStart = 1.6;

    const frameWidth = 0.46;
    const frameHeight = 0.8;
    const frameDepth = 0.01;
    const paneWidth = 0.38;
    const paneHeight = 0.66;
    const paneDepth = 0.03;
    const frameOutset = 0.003;
    const paneOutset = 0.003;

    const frontFrameZ = bodyDepth / 2 + frameDepth / 2 + frameOutset;
    const sideFrameX = bodyWidth / 2 + frameDepth / 2 + frameOutset;
    const frontPaneZ = frontFrameZ + frameDepth / 2 + paneDepth / 2 + paneOutset;
    const sidePaneX = sideFrameX + frameDepth / 2 + paneDepth / 2 + paneOutset;

    function addWindowFrame(x, y, z, rotationY = 0) {
        const frameMesh = new THREE.Mesh(new THREE.BoxGeometry(frameWidth, frameHeight, frameDepth), windowFrameMaterial);
        frameMesh.position.set(x, y, z);
        frameMesh.rotation.y = rotationY;
        windowGroup.add(frameMesh);
    }

    function addWindowPane(x, y, z, rotationY = 0) {
        const paneMesh = new THREE.Mesh(new THREE.BoxGeometry(paneWidth, paneHeight, paneDepth), windowMaterial);
        paneMesh.position.set(x, y, z);
        paneMesh.rotation.y = rotationY;
        windowGroup.add(paneMesh);
        windows.push(paneMesh);
    }

    for (let row = 0; row < windowRows; row += 1) {
        for (let col = 0; col < windowCols; col += 1) {
            const x = (col - 0.5) * windowGapX;
            const y = yStart + row * windowGapY;

            addWindowFrame(x, y, frontFrameZ, 0);
            addWindowPane(x, y, frontPaneZ, 0);

            addWindowFrame(x, y, -frontFrameZ, 0);
            addWindowPane(x, y, -frontPaneZ, 0);

            const z = (col - 0.5) * windowGapX;
            addWindowFrame(sideFrameX, y, z, Math.PI / 2);
            addWindowPane(sidePaneX, y, z, Math.PI / 2);

            addWindowFrame(-sideFrameX, y, z, Math.PI / 2);
            addWindowPane(-sidePaneX, y, z, Math.PI / 2);
        }
    }

    building.add(windowGroup);

    building.userData.height = bodyHeight;
    building.userData.windows = windows;
    building.userData.windowLighting = {
        lightColor: WINDOW_BLUE_COLOR,
        lightEmissive: WINDOW_BLUE_EMISSIVE,
        lightIntensity: 0.85,
        darkColor: 0xffd45a,
        darkEmissive: 0xffd04d,
        darkIntensity: 1.0,
        shadowThreshold: 0,
        darkReach: 1 / 3,
        transitionSpeed: 1.0
    };

    building.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return building;
}
