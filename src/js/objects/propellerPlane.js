import * as THREE from 'three';

export function createPropellerPlane() {
    const plane = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd62f2f, roughness: 0.5, metalness: 0.1 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6, metalness: 0.05 });
    const propellerMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4, metalness: 0.3 });

    // Fuselage
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 10, 24), bodyMaterial);
    fuselage.rotation.z = Math.PI / 2;
    plane.add(fuselage);

    // Nose cone
    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.1, 24), accentMaterial);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 6;
    plane.add(nose);

    // Cockpit canopy
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.85, 18, 14), new THREE.MeshStandardMaterial({
        color: 0x88bde6,
        roughness: 0.2,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
    }));
    canopy.scale.set(1, 0.75, 1.3);
    canopy.position.set(0.7, 1.05, 0);
    plane.add(canopy);

    // Main wings
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.18, 11), accentMaterial);
    wing.position.set(0, 0, 0);
    plane.add(wing);

    // Tail wing (horizontal stabilizer)
    const tailWing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 4.2), accentMaterial);
    tailWing.position.set(-4.2, 0.55, 0);
    plane.add(tailWing);

    // Vertical stabilizer
    const verticalTail = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.16), accentMaterial);
    verticalTail.position.set(-4.7, 1.15, 0);
    plane.add(verticalTail);

    // Propeller hub
    const propellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 16), propellerMaterial);
    propellerHub.rotation.z = Math.PI / 2;
    propellerHub.position.set(6.8, 0, 0);
    plane.add(propellerHub);

    // Propeller blades grouped so it is easy to animate with a single rotation
    const propeller = new THREE.Group();
    propeller.position.set(6.95, 0, 0);

    const bladeGeometry = new THREE.BoxGeometry(0.18, 2.9, 0.38);
    const bladeA = new THREE.Mesh(bladeGeometry, propellerMaterial);
    bladeA.position.y = 1.45;
    propeller.add(bladeA);

    const bladeB = new THREE.Mesh(bladeGeometry, propellerMaterial);
    bladeB.position.y = -1.45;
    bladeB.rotation.x = Math.PI;
    propeller.add(bladeB);

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
