import * as THREE from 'three';

export function createPropellerPlane() {
    const plane = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd62f2f, roughness: 0.5, metalness: 0.1 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6, metalness: 0.05 });
    const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.3 });

    // Fuselage
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.05, 10, 24), bodyMaterial);
    fuselage.rotation.z = Math.PI / 2 ;
    plane.add(fuselage);

    // Nose cone
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.0 , 0.7, 24), accentMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 5.3;
    plane.add(nose);

    // Cockpit canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 18, 14), new THREE.MeshStandardMaterial({
        color: 0x88bde6,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
    }));
    canopy.scale.set(1.5, 1, 0.8);
    canopy.position.set(0.7, 0.5, 0);
    plane.add(canopy);

    // Main wings
    const wingGroup = new THREE.Group();
    wingGroup.position.set(1.2, 0.03, 0);

    const createTaperedWingGeometry = () => {
        const geometry = new THREE.BoxGeometry(1.7, 0.18, 5.2);
        const position = geometry.attributes.position;
        const halfSpan = 5.2 / 2;

        for (let i = 0; i < position.count; i += 1) {
            const x = position.getX(i);
            const z = position.getZ(i);
            const spanFactor = (z + halfSpan) / (halfSpan * 2);
            const widthScale = 1.35 - (spanFactor * 0.55);
            position.setX(i, x * widthScale);
        }

        geometry.computeVertexNormals();
        return geometry;
    };

    const leftWing = new THREE.Mesh(createTaperedWingGeometry(), accentMaterial);
    leftWing.position.set(0, 0, 2.6);
    leftWing.rotation.y = 0.09;

    wingGroup.add(leftWing);

    const rightWing = new THREE.Mesh(createTaperedWingGeometry(), accentMaterial);
    rightWing.position.set(0, 0, -2.6);
    rightWing.rotation.y = -0.09;
    rightWing.scale.z = -1;
    wingGroup.add(rightWing);

    plane.add(wingGroup);

    // Tail wing (horizontal stabilizer)
    const tailWingGroup = new THREE.Group();
    tailWingGroup.position.set(-4.2, 0.3, 0);

    const createTailWingGeometry = () => {
        const geometry = new THREE.BoxGeometry(0.9, 0.14, 2.2);
        const position = geometry.attributes.position;
        const halfSpan = 4.2 / 2;

        for (let i = 0; i < position.count; i += 1) {
            const x = position.getX(i);
            const z = position.getZ(i);
            const spanFactor = (z + halfSpan) / (halfSpan * 2);
            const widthScale = 1.25 - (spanFactor * 0.35);
            position.setX(i, x * widthScale);
        }

        geometry.computeVertexNormals();
        return geometry;
    };

    const tailWingLeft = new THREE.Mesh(createTailWingGeometry(), accentMaterial);
    tailWingLeft.position.set(0, 0, 1.10);
    tailWingLeft.rotation.y = -0.05;
    tailWingGroup.add(tailWingLeft);

    const tailWingRight = new THREE.Mesh(createTailWingGeometry(), accentMaterial);
    tailWingRight.position.set(0, 0, -1.10);
    tailWingRight.rotation.y = 0.05;
    tailWingRight.scale.z = -1;
    tailWingGroup.add(tailWingRight);

    plane.add(tailWingGroup);

    // Vertical stabilizer
    const verticalTailGeometry = new THREE.BoxGeometry(0.95, 1.3, 0.16);
    const verticalTailPosition = verticalTailGeometry.attributes.position;
    const halfHeight = 0.75 / 2;

    for (let i = 0; i < verticalTailPosition.count; i += 1) {
        const x = verticalTailPosition.getX(i);
        const y = verticalTailPosition.getY(i);
        const heightFactor = (y + halfHeight) / (halfHeight * 2);
        const widthScale = 1.25 - (heightFactor * 0.45);
        verticalTailPosition.setX(i, x * widthScale);
    }

    verticalTailGeometry.computeVertexNormals();

    const verticalTail = new THREE.Mesh(verticalTailGeometry, accentMaterial);
    verticalTail.position.set(-4.42, 1.11, 0);
    verticalTail.rotation.z = 0.14
    plane.add(verticalTail);

    // Propeller hub
    const propellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 16), propellerMaterial);
    propellerHub.rotation.z = Math.PI / 2;
    propellerHub.position.set(5.8, 0, 0);
    plane.add(propellerHub);

    // Propeller blades grouped so it is easy to animate with a single rotation
    const propeller = new THREE.Group();
    propeller.position.set(6.1, 0, 0);

    const bladeLength = 1.4;
    const bladeGeometry = new THREE.BoxGeometry(0.14, bladeLength, 0.28);
    bladeGeometry.translate(0, bladeLength / 2, 0);
    for (let i = 0; i < 3; i += 1) {
        const blade = new THREE.Mesh(bladeGeometry, propellerMaterial);
        blade.rotation.x = (i * Math.PI * 2) / 3;
        propeller.add(blade);
    }

    plane.add(propeller);

    // Expose the propeller mesh for easy animation from the main loop.
    plane.userData.propeller = propeller;

    plane.castShadow = true;
    plane.receiveShadow = true;

    plane.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return plane;
}
