import * as THREE from 'three';
import { createTree } from './tree.js';

export function createForest() {
    const forest = new THREE.Group();

    // 4 trees, not too close but not too far from each other
    const positions = [
        { x: -3.5, z: -1.3 },
        { x: 1, z: -3 },
        { x: -1.5, z: 1.5 },
        { x: 2.5, z: 1.5 }
    ];

    positions.forEach(pos => {
        const tree = createTree();
        tree.position.set(pos.x, 0, pos.z);

        // Add a slight random rotation for variation
        tree.rotation.y = Math.random() * Math.PI * 2;

        // Add a slight random scale for variation
        const scale = 0.9 + Math.random() * 0.2;
        tree.scale.set(scale, scale, scale);

        forest.add(tree);
    });

    return forest;
}
