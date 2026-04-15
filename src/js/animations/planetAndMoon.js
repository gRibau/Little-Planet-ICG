// Animation state
let moonOrbitAngle = 0;
const motionDirection = 1;

export function planetAndMoonAnimations(planet, moon) {
    // Automatic rotations
    planet.rotation.y += 0.004 * motionDirection;
    moon.rotation.y += 0.004 * motionDirection;

    // Orbit the Moon around the Planet
    moonOrbitAngle += 0.005 * -1 * motionDirection;
    const orbitRadius = 80;

    const flatX = Math.cos(moonOrbitAngle) * orbitRadius;
    const flatZ = Math.sin(moonOrbitAngle) * orbitRadius;

    moon.position.x = planet.position.x + flatX;
    moon.position.z = planet.position.z + flatZ;

    const tiltSteepness = 0.5; 
    moon.position.y = planet.position.y + (flatX - flatZ) * tiltSteepness;
}