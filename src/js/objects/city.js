import * as THREE from 'three';
import { createSkyscraper } from './skyscraper.js';
import { createMidrise } from './midrise.js';
export function createCity(options = {}) {
    const {
        spacing = 1.0
    } = options;

    const city = new THREE.Group();
    const buildings = [];

    const layout = [
        { kind: 'tower', x: -1.8, z: -0.4, scale: [0.75, 1.0, 0.75], yaw: 0, tiltX: 0, tiltZ: 0 },
        { kind: 'tower', x: 1.8, z: -0.4, scale: [0.75, 1.0, 0.75], yaw: 0, tiltX: 0, tiltZ: 0 },
        { kind: 'midrise', x: -4.6, z: 2.2, scale: [0.95, 1.0, 0.95], yaw: 28, tiltX: 2.6, tiltZ: 2.0 },
        { kind: 'midrise', x: 4.5, z: 3.2, scale: [0.9, 1.0, 0.9], yaw: -22, tiltX: -2.4, tiltZ: 2.2 },
        { kind: 'midrise', x: -3.6, z: -4.6, scale: [0.85, 1.0, 0.85], yaw: 46, tiltX: 2.8, tiltZ: -2.6 },
        { kind: 'midrise', x: 3.6, z: -4.1, scale: [0.88, 1.0, 0.88], yaw: -40, tiltX: -3.0, tiltZ: -2.2 },
        { kind: 'midrise', x: -5.6, z: -1.6, scale: [0.82, 1.0, 0.82], yaw: 18, tiltX: 2.2, tiltZ: -1.6 },
        { kind: 'midrise', x: 5.8, z: -1.8, scale: [0.8, 1.0, 0.8], yaw: -18, tiltX: -2.0, tiltZ: -1.4 }
    ];

    for (const spot of layout) {
        const building = spot.kind === 'tower' ? createSkyscraper() : createMidrise();
        building.scale.set(spot.scale[0], spot.scale[1], spot.scale[2]);
        building.position.set(spot.x * spacing, 0, spot.z * spacing);
        building.rotation.set(
            THREE.MathUtils.degToRad(spot.tiltX ?? 0),
            THREE.MathUtils.degToRad(spot.yaw ?? 0),
            THREE.MathUtils.degToRad(spot.tiltZ ?? 0)
        );
        city.add(building);

        buildings.push(building);
    }

    city.userData.buildings = buildings;

    return city;
}
