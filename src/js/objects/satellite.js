import * as THREE from 'three';

export function createSatellite() {
    const satellite = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0xb0b7c3,
        roughness: 0.45,
        metalness: 0.6
    });

    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x2b5f9e,
        roughness: 0.35,
        metalness: 0.2,
        emissive: 0x0a1a2f,
        emissiveIntensity: 0.4
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5f66,
        roughness: 0.55,
        metalness: 0.5
    });

    const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0x5a5f66,
        roughness: 0.55,
        metalness: 0.5,
        side: THREE.DoubleSide
    });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.6, 24), bodyMaterial);
    body.rotation.z = Math.PI / 2;
    satellite.add(body);

    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 12, 24), trimMaterial);
    coreRing.rotation.y = Math.PI / 2;
    satellite.add(coreRing);

    const panelGeometry = new THREE.BoxGeometry(1.9, 0.05, 0.7);

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    // rotate panels 90 degrees around Y and tilt them slightly around their length axis
    leftPanel.rotation.y = Math.PI / 2;
    leftPanel.position.set(0, 0, 1.40);
    satellite.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.rotation.y = Math.PI / 2;
    rightPanel.position.set(0, 0, -1.40);
    satellite.add(rightPanel);

    const panelStrut = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.35), trimMaterial);
    // align struts to face outwards toward the panels (along Z)
    panelStrut.rotation.y = Math.PI / 2;
    panelStrut.position.set(0, 0, 0.6);
    satellite.add(panelStrut);

    const panelStrutOpposite = panelStrut.clone();
    panelStrutOpposite.position.set(0, 0, -0.6);
    satellite.add(panelStrutOpposite);

    // Parabolic antenna - detailed structure
    const antennaGroup = new THREE.Group();
    
    // Create parabolic dish using LatheGeometry
    const points = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const x = t * 0.5;  // radius increases
        const y = t * t * 0.6;  // parabolic curve (y = x²)
        points.push(new THREE.Vector2(x, y));
    }
    
    const dishGeometry = new THREE.LatheGeometry(points, 24, 0, Math.PI * 2);
    const antennaDish = new THREE.Mesh(dishGeometry, antennaMaterial);
    antennaDish.scale.set(1, 1, 1.2);
    antennaGroup.add(antennaDish);
    
    // Support struts - create an X pattern
    const strutGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
    
    const strut1 = new THREE.Mesh(strutGeometry, antennaMaterial);
    strut1.rotation.z = Math.PI / 4;
    strut1.position.set(0, 0.15, 0);
    antennaGroup.add(strut1);
    
    const strut2 = new THREE.Mesh(strutGeometry, antennaMaterial);
    strut2.rotation.z = -Math.PI / 4;
    strut2.position.set(0, 0.15, 0);
    antennaGroup.add(strut2);
    
    const strut3 = new THREE.Mesh(strutGeometry, antennaMaterial);
    strut3.rotation.x = Math.PI / 4;
    strut3.position.set(0, 0.15, 0);
    antennaGroup.add(strut3);
    
    const strut4 = new THREE.Mesh(strutGeometry, antennaMaterial);
    strut4.rotation.x = -Math.PI / 4;
    strut4.position.set(0, 0.15, 0);
    antennaGroup.add(strut4);
    
    // Central mounting ring
    const mountingRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 12, 24), antennaMaterial);
    mountingRing.position.set(0, 0, 0);
    antennaGroup.add(mountingRing);
    
    // Feed horn at the focus point
    const feedHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.35, 12), antennaMaterial);
    feedHorn.position.set(0, 0.35, 0);
    antennaGroup.add(feedHorn);
    
    // Feed connector (small cylinder)
    const connector = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), antennaMaterial);
    connector.position.set(0, 0.6, 0);
    antennaGroup.add(connector);
    
    // Position the entire antenna group and rotate 90 degrees to align with body
    antennaGroup.position.set(0.8, 0, 0);
    antennaGroup.rotation.z = 3 * Math.PI / 2;
    antennaGroup.scale.set(0.65, 0.65, 0.65);
    satellite.add(antennaGroup);

    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 12), trimMaterial);
    antenna.position.set(-0.75, 0.1, 0.12);
    antenna.rotation.z = Math.PI / 2;
    satellite.add(antenna);

    const thrusterGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 12);
    const thrusterLeft = new THREE.Mesh(thrusterGeometry, trimMaterial);
    // align thruster axis outwards from the body (along Z) and place at the body's side
    thrusterLeft.rotation.x = Math.PI / 2;
    thrusterLeft.position.set(0, 0, 0.43);
    satellite.add(thrusterLeft);

    const thrusterRight = thrusterLeft.clone();
    thrusterRight.position.set(0, 0, -0.43);
    satellite.add(thrusterRight);

    satellite.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return satellite;
}
