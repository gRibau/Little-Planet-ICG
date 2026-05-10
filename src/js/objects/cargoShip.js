import * as THREE from 'three';

export function createCargoShip() {
    const ship = new THREE.Group();

    const hullMaterial = new THREE.MeshStandardMaterial({
        color: 0x2c3e50,
        roughness: 0.85,
        metalness: 0.1
    });
    hullMaterial.side = THREE.FrontSide;
    hullMaterial.flatShading = true;
    hullMaterial.needsUpdate = true;

    const deckMaterial = new THREE.MeshStandardMaterial({
        color: 0x3f4f5a,
        roughness: 0.8,
        metalness: 0.1
    });

    const containerMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xbf3b2f, roughness: 0.75, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0x2b7a78, roughness: 0.75, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0xd09f3a, roughness: 0.75, metalness: 0.1 })
    ];

    const cabinMaterial = new THREE.MeshStandardMaterial({
        color: 0xe0e6ea,
        roughness: 0.6,
        metalness: 0.1
    });

    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x6ab0ff,
        emissive: 0x1a3d6d,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.1
    });

    const craneMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b8f94,
        roughness: 0.7,
        metalness: 0.2
    });

    const hullLength = 12.0;
    const hullWidth = 3.2;
    const hullHeight = 1.6;
    const hullDepth = 0.9;

    const hullGeometry = new THREE.BufferGeometry();
    const hullHalfWidth = hullWidth / 2;
    const hullFrontZ = hullLength / 2;
    const hullBackZ = -hullLength / 2;
    const hullVertices = new Float32Array([
        -hullHalfWidth, hullHeight, hullFrontZ,
        hullHalfWidth, hullHeight, hullFrontZ,
        0, -hullDepth, hullFrontZ,
        -hullHalfWidth, hullHeight, hullBackZ,
        hullHalfWidth, hullHeight, hullBackZ,
        0, -hullDepth, hullBackZ
    ]);
    const hullIndices = [
        0, 2, 1,
        3, 4, 5,
        0, 1, 4,
        0, 4, 3,
        0, 3, 5,
        0, 5, 2,
        1, 2, 5,
        1, 5, 4
    ];
    hullGeometry.setAttribute('position', new THREE.BufferAttribute(hullVertices, 3));
    hullGeometry.setIndex(hullIndices);
    hullGeometry.computeVertexNormals();

    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    ship.add(hull);

    const bowLength = 2.0;
    const bowGeometry = new THREE.BufferGeometry();
    const bowVertices = new Float32Array([
        -hullWidth / 2, hullHeight, 0,
        hullWidth / 2, hullHeight, 0,
        0, hullHeight, bowLength,
        0, -hullDepth, 0
    ]);
    const bowIndices = [
        0, 2, 1,
        0, 3, 2,
        3, 1, 2,
        0, 1, 3
    ];
    bowGeometry.setAttribute('position', new THREE.BufferAttribute(bowVertices, 3));
    bowGeometry.setIndex(bowIndices);
    bowGeometry.computeVertexNormals();

    const bow = new THREE.Mesh(bowGeometry, hullMaterial);
    bow.position.set(0, 0, hullLength / 2);
    ship.add(bow);

    const sternLength = 2.0;
    const sternWidth = hullWidth * 0.70;
    const sternHeight = hullHeight * 0.7;
    const sternDepth = hullDepth * 0.7;
    const sternGeometry = new THREE.BufferGeometry();
    const sternHalfWidth = sternWidth / 2;
    const sternFrontZ = sternLength / 2;
    const sternBackZ = -sternLength / 2;
    const sternVertices = new Float32Array([
        -sternHalfWidth, sternHeight, sternFrontZ,
        sternHalfWidth, sternHeight, sternFrontZ,
        0, -sternDepth, sternFrontZ,
        -sternHalfWidth, sternHeight, sternBackZ,
        sternHalfWidth, sternHeight, sternBackZ,
        0, -sternDepth, sternBackZ
    ]);
    const sternIndices = [
        0, 2, 1,
        3, 4, 5,
        0, 1, 4,
        0, 4, 3,
        0, 3, 5,
        0, 5, 2,
        1, 2, 5,
        1, 5, 4
    ];
    sternGeometry.setAttribute('position', new THREE.BufferAttribute(sternVertices, 3));
    sternGeometry.setIndex(sternIndices);
    sternGeometry.computeVertexNormals();

    const stern = new THREE.Mesh(sternGeometry, hullMaterial);
    stern.position.set(0, -hullDepth + sternDepth, -hullLength / 2 - sternLength / 2);
    ship.add(stern);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(hullWidth * 0.95, 0.25, hullLength * 0.86), deckMaterial);
    deck.position.y = hullHeight + 0.12;
    ship.add(deck);

    const deckHouseBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.6), cabinMaterial);
    deckHouseBase.position.set(0, hullHeight + 0.95, -hullLength / 2 + 2.2);
    ship.add(deckHouseBase);

    const deckHouseTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.8), cabinMaterial);
    deckHouseTop.position.set(0, hullHeight + 1.75, -hullLength / 2 + 2.1);
    ship.add(deckHouseTop);

    const bridgeWindow = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.05), windowMaterial);
    bridgeWindow.position.set(0, hullHeight + 1.75, -hullLength / 2 + 1.2);
    ship.add(bridgeWindow);

    const bridgeWindowOpposite = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 0.05), windowMaterial);
    bridgeWindowOpposite.position.set(0, hullHeight + 1.75, -hullLength / 2 + 3.0);
    ship.add(bridgeWindowOpposite);

    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.6, 8), cabinMaterial);
    mast.position.set(0.7, hullHeight + 2.3, -hullLength / 2 + 2.2);
    ship.add(mast);

    const containerLength = 1.6;
    const containerWidth = 0.9;
    const containerHeight = 0.6;

    const containerGeometry = new THREE.BoxGeometry(containerWidth, containerHeight, containerLength);
    const containerY = hullHeight + 0.5;
    const containerColumns = 2;
    const containerRows = 3;
    const containerXSpacing = containerWidth + 0.04;
    const containerZSpacing = containerLength + 0.08;
    const containerXStart = -((containerColumns - 1) * containerXSpacing) / 2 + 0.25;
    const containerZStart = 3.4;
    const containerLayers = 2;
    const containerLayerGap = containerHeight;

    for (let layer = 0; layer < containerLayers; layer += 1) {
        const y = containerY + layer * containerLayerGap;
        for (let row = 0; row < containerRows; row += 1) {
            const z = containerZStart - row * containerZSpacing;
            for (let col = 0; col < containerColumns; col += 1) {
                const x = containerXStart + col * containerXSpacing;
                const colorIndex = (row * containerColumns + col + layer) % containerMaterials.length;
                const container = new THREE.Mesh(containerGeometry, containerMaterials[colorIndex]);
                container.position.set(x, y, z);
                ship.add(container);
            }
        }
    }

    const craneBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 1.2, 10), craneMaterial);
    craneBase.position.set(-1.1, hullHeight + 0.8, -0.8);
    ship.add(craneBase);

    const craneArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 3.0), craneMaterial);
    craneArm.position.set(-1.1, hullHeight + 1.4, 0.4);
    craneArm.rotation.x = THREE.MathUtils.degToRad(4);
    ship.add(craneArm);

    const craneHook = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6), craneMaterial);
    craneHook.position.set(-1.1, hullHeight + 0.9, 1.7);
    ship.add(craneHook);

    const lifeboat = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.9, 8), containerMaterials[0]);
    lifeboat.rotation.z = Math.PI / 2;
    lifeboat.position.set(-1.5, hullHeight + 0.9, -hullLength / 2 + 2.6);
    ship.add(lifeboat);

    ship.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return ship;
}
