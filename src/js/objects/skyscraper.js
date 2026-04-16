import * as THREE from 'three';

const WINDOW_BLUE_COLOR = 0x4f80ff;
const WINDOW_BLUE_EMISSIVE = 0x163a92;

export function createSkyscraper() {
    const skyscraper = new THREE.Group();

    const bodyWidth = 3.4;
    const bodyDepth = 3.4;
    const bodyHeight = 14;

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.72,
        metalness: 0.08
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.68,
        metalness: 0.1
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
    skyscraper.add(body);

    const midSection = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.8), accentMaterial);
    midSection.position.y = bodyHeight + 1.1;
    skyscraper.add(midSection);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.2, 2.1), bodyMaterial);
    roof.position.y = bodyHeight + 2.8;
    skyscraper.add(roof);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 10), accentMaterial);
    antenna.position.y = bodyHeight + 4.1;
    skyscraper.add(antenna);

    const windowGroup = new THREE.Group();
    const windows = [];

    const windowRows = 6;
    const windowCols = 3;
    const windowGapY = 1.75;
    const windowGapX = 0.9;
    const yStart = 2.0;

    const frameWidth = 0.46;
    const frameHeight = 0.82;
    const frameDepth = 0.01;
    const paneWidth = 0.38;
    const paneHeight = 0.68;
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
            const x = (col - 1) * windowGapX;
            const y = yStart + row * windowGapY;

            // Front / back
            addWindowFrame(x, y, frontFrameZ, 0);
            addWindowPane(x, y, frontPaneZ, 0);

            addWindowFrame(x, y, -frontFrameZ, 0);
            addWindowPane(x, y, -frontPaneZ, 0);

            // Left / right
            const z = (col - 1) * windowGapX;
            addWindowFrame(sideFrameX, y, z, Math.PI / 2);
            addWindowPane(sidePaneX, y, z, Math.PI / 2);

            addWindowFrame(-sideFrameX, y, z, Math.PI / 2);
            addWindowPane(-sidePaneX, y, z, Math.PI / 2);
        }
    }

    skyscraper.add(windowGroup);

    skyscraper.userData.height = bodyHeight;
    skyscraper.userData.windows = windows;

    skyscraper.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return skyscraper;
}
