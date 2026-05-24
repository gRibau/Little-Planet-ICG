import * as THREE from 'three';

// 1. Defined waypoints in spherical coordinates that stay strictly in deep ocean (verified by analysis)
const waypoints = [
    { lat: -5, lon: 160 },
    { lat: -5, lon: 100 },
    { lat: -5, lon: 40 },
    { lat: 5, lon: 10 },
    { lat: 5, lon: -10 },
    { lat: -15, lon: -45 },
    { lat: -15, lon: -90 },
    { lat: -15, lon: -135 },
    { lat: -5, lon: -180 }, // wraps around the planet
];

const planetRadius = 25;
const shipAltitude = 0.08; // sit perfectly in the water

// Helper: Convert lat/lon degrees to standard ICG-Project Cartesian coordinates
function sphericalToCartesian(latDeg, lonDeg, radius, altitude) {
    const lat = THREE.MathUtils.degToRad(latDeg);
    const lon = THREE.MathUtils.degToRad(lonDeg);
    const x = Math.cos(lat) * Math.cos(lon);
    const y = Math.sin(lat);
    const z = Math.cos(lat) * Math.sin(lon);
    return new THREE.Vector3(x, y, z).normalize().multiplyScalar(radius + altitude);
}

// Convert spherical waypoints to 3D Cartesian coordinates
const curvePoints = waypoints.map(wp => 
    sphericalToCartesian(wp.lat, wp.lon, planetRadius, shipAltitude)
);

// Create a closed Catmull-Rom spline curve that naturally interpolates between the waypoints
const shipRoute = new THREE.CatmullRomCurve3(curvePoints, true);

let shipElapsedTime = 0;
const loopDuration = 120; // 120 seconds to make a complete, elegant lap around the globe

export function cargoShipAnimations(cargoShip, planet, deltaTime = 1 / 60) {
    if (!cargoShip) return;

    shipElapsedTime += deltaTime;
    const t = (shipElapsedTime / loopDuration) % 1.0;

    // 1. Get raw position along the spline
    const rawPos = shipRoute.getPointAt(t);

    // 2. Project back onto the exact sphere surface.
    // The water surface is actually at radius 24.5 because of displacementBias: -0.5.
    // The ship's bottom is at local Y = -0.9. With scale 0.6, the bottom is -0.54 below origin.
    // So the origin must be at radius 24.5 + 0.54 = 25.04 to keep the bottom exactly on the water.
    const waterRadius = 24.5;
    const shipBottomOffset = 0.54;
    const targetRadius = waterRadius + shipBottomOffset;

    const shipPosLocal = rawPos.clone().normalize().multiplyScalar(targetRadius);

    // 3. Calculate traveling direction (tangent of the curve)
    const tangent = shipRoute.getTangentAt(t).normalize();

    // Up vector is the local surface normal (pointing directly away from the planet center)
    const up = shipPosLocal.clone().normalize();

    // Project tangent onto the local horizontal plane to ensure it remains parallel to the ocean surface
    const forward = tangent.clone().sub(up.clone().multiplyScalar(tangent.dot(up))).normalize();

    // Right vector must be Up x Forward to maintain a valid right-handed coordinate system (Determinant = +1).
    // Previously, Forward x Up resulted in Left (-X), creating a reflection matrix which broke the quaternion!
    const right = new THREE.Vector3().crossVectors(up, forward).normalize();

    // 4. Align the cargo ship model.
    // The ship's front is aligned to +Z, up to +Y, right to +X.
    const basisMatrix = new THREE.Matrix4().makeBasis(right, up, forward);
    const localQuat = new THREE.Quaternion().setFromRotationMatrix(basisMatrix);

    // 5. Handle world vs local parent space
    if (cargoShip.parent === planet) {
        // If it is a child of planet, we set local coordinates directly
        cargoShip.position.copy(shipPosLocal);
        cargoShip.quaternion.copy(localQuat);
    } else {
        // If it is in the scene (world space), we manually apply the planet's rotation and position
        const rotatedOffset = shipPosLocal.clone().applyQuaternion(planet.quaternion);
        cargoShip.position.copy(planet.position).add(rotatedOffset);
        
        // Combine planet rotation with local ship orientation
        cargoShip.quaternion.copy(localQuat).premultiply(planet.quaternion);
    }
}
