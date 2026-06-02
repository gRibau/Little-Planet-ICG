import * as THREE from 'three';

// Animation state
let moonOrbitAngle = 0;
let satelliteOrbitAngle = 0;
const motionDirection = 1;

export function planetAndMoonAnimations(planet, moon, satellite) {
    // Automatic rotations
    planet.rotation.y += 0.004 * motionDirection;

    // Orbit the Moon around the Planet
    moonOrbitAngle += 0.005 * -1 * motionDirection;
    const orbitRadius = 80;

    const flatX = Math.cos(moonOrbitAngle) * orbitRadius;
    const flatZ = Math.sin(moonOrbitAngle) * orbitRadius;

    moon.position.x = planet.position.x + flatX;
    moon.position.z = planet.position.z + flatZ;

    const tiltSteepness = 0.5;
    moon.position.y = planet.position.y + (flatX - flatZ) * tiltSteepness;

    // Keep the moon's spin synchronized with its orbit so the same face
    // stays toward the planet and the far side remains stable.
    moon.rotation.y = -moonOrbitAngle + Math.PI;

    if (satellite && !satellite.userData.isFiring) {
        satelliteOrbitAngle += 0.008 * -1 * motionDirection;
        const satelliteOrbitRadius = 64;

        const satelliteFlatX = Math.cos(satelliteOrbitAngle) * satelliteOrbitRadius;
        const satelliteFlatZ = Math.sin(satelliteOrbitAngle) * satelliteOrbitRadius;

        satellite.position.x = planet.position.x + satelliteFlatX;
        satellite.position.z = planet.position.z + satelliteFlatZ;
        satellite.position.y = planet.position.y + (satelliteFlatX - satelliteFlatZ) * tiltSteepness;

        satellite.lookAt(planet.position);
        satellite.rotateY(-Math.PI / 2);
    }
}