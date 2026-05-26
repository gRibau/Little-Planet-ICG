import * as THREE from 'three';
import { createHut } from './hut.js';

export function createSettlement() {
    const settlement = new THREE.Group();
    const buildings = [];

    // Create the first hut (placed slightly to the left, turned slightly to the right/inward)
    const hut1 = createHut();
    hut1.scale.setScalar(0.9);
    hut1.position.set(-2.2, 0, 0);
    // Rotate slightly to the right (positive Y rotation)
    hut1.rotation.y = THREE.MathUtils.degToRad(18);
    settlement.add(hut1);
    buildings.push(hut1);

    // Create the second hut (placed slightly to the right, turned slightly to the left/inward)
    const hut2 = createHut();
    hut2.scale.setScalar(0.78); // slightly smaller for natural variation
    hut2.position.set(2.2, 0, 0.2); // slight Z offset for a more organic feel
    // Rotate slightly to the left (negative Y rotation)
    hut2.rotation.y = THREE.MathUtils.degToRad(-18);
    settlement.add(hut2);
    buildings.push(hut2);

    // Group-level shadows
    settlement.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    settlement.userData.buildings = buildings;

    return settlement;
}
