import * as THREE from 'three';
import { createHouse } from './house.js';

export function createNeighborhood() {
    const neighborhood = new THREE.Group();

    // Planet radius in local coordinates. 
    // Planet radius is 25, and this group is scaled by 0.5 in main.js -> local R = 50
    const localRadius = 50;

    // Fixed, random-looking positions that are properly spaced and perfectly centered
    const configs = [
        { x: -11.1, z: -9.8, rotY: 0.4, color: 0x4a6278 },   // Blue
        { x: 11.5, z: -12.1, rotY: 2.1 + Math.PI, color: 0xd982b5 },   // Pink
        { x: -9.2, z: 11.8, rotY: 1.2, color: 0xd4a820 },   // Yellow
        { x: 8.7, z: 10.2, rotY: -2.8 + Math.PI, color: 0x4a7852 }     // Green
    ];

    const buildings = [];

    configs.forEach(conf => {
        const house = createHouse(conf.color);
        
        // Calculate how much the spherical surface curves downward at this (x, z)
        const x = conf.x;
        const z = conf.z;
        const yOffset = localRadius - Math.sqrt(localRadius * localRadius - x * x - z * z);
        
        house.position.set(x, -yOffset, z);

        // Calculate the normal of the sphere at this position
        // The center of the sphere in local space is at (0, -localRadius, 0)
        const normal = new THREE.Vector3(x, localRadius - yOffset, z).normalize();
        
        // Create a quaternion that rotates the UP vector (0, 1, 0) to match the sphere's normal
        const alignQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        
        // The house's individual Y rotation
        const rotYQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), conf.rotY);
        
        // Combine rotations: first spin around Y, then tilt to align with the sphere normal
        house.quaternion.copy(alignQuat).multiply(rotYQuat);
        
        neighborhood.add(house);
        buildings.push(house);
    });

    neighborhood.userData.buildings = buildings;

    return neighborhood;
}
