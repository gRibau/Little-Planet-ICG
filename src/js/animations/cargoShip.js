import * as THREE from 'three';

// =============================================
// Waypoints (lat/lon in degrees) — edit these manually.
// The ship sails through them in order, looping back to the start.
const waypoints = [
    { lat: -16, lon: 173 },
    { lat: -34, lon: 123 },
    { lat: -21, lon: 67 },
    { lat: 3, lon: 43 },
    { lat: 10, lon: -12 },
    { lat: 5, lon: -89 },
    { lat: -38, lon: -142 }
    // {lat: , lon: }
];

// =============================================
// Configuration
const PLANET_RADIUS = 25;
const WATER_RADIUS = 24.5;       // Planet radius (25) + displacementBias (-0.5)
const SHIP_SINK = 0.2;           // How far below the water surface the ship origin sits
const LOOP_DURATION = 120;       // Seconds for one full loop

// =============================================
// Helper: lat/lon → surface normal (same math as placeModelOnPlanet)

const _normal = new THREE.Vector3();

function latLonToNormal(latDeg, lonDeg) {
    const lat = THREE.MathUtils.degToRad(latDeg);
    const lon = THREE.MathUtils.degToRad(lonDeg);
    return _normal.set(
        Math.cos(lat) * Math.cos(lon),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lon)
    ).normalize().clone();
}

// =============================================
// Build the spline from waypoints

const curvePoints = waypoints.map(wp =>
    latLonToNormal(wp.lat, wp.lon).multiplyScalar(PLANET_RADIUS)
);

const shipRoute = new THREE.CatmullRomCurve3(curvePoints, true);

// =============================================
// Reusable temporaries (avoids per-frame allocations)
const _up = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _shipPos = new THREE.Vector3();
const _rotatedOffset = new THREE.Vector3();
const _basisMatrix = new THREE.Matrix4();
const _localQuat = new THREE.Quaternion();

let shipElapsedTime = 0;

// =============================================
// Animation tick

export function cargoShipAnimations(cargoShip, planet, deltaTime = 1 / 60) {
    if (!cargoShip) return;

    shipElapsedTime += deltaTime;
    const t = (shipElapsedTime / LOOP_DURATION) % 1.0;

    // 1. Sample the spline and project onto the water surface
    const rawPos = shipRoute.getPointAt(t);
    _shipPos.copy(rawPos).normalize().multiplyScalar(WATER_RADIUS - SHIP_SINK);

    // 2. Surface normal = outward direction (same as placeModelOnPlanet uses)
    _up.copy(_shipPos).normalize();

    // 3. Travel direction: spline tangent projected onto the local tangent plane
    const tangent = shipRoute.getTangentAt(t);
    _forward.copy(tangent)
        .sub(_up.clone().multiplyScalar(tangent.dot(_up)))
        .normalize();

    // 4. Right vector completes the basis (Up × Forward for right-handed system)
    _right.crossVectors(_up, _forward).normalize();

    // 5. Build orientation quaternion (ship model: +X right, +Y up, +Z forward)
    _basisMatrix.makeBasis(_right, _up, _forward);
    _localQuat.setFromRotationMatrix(_basisMatrix);

    // 6. Apply position & rotation in the correct coordinate space
    if (cargoShip.parent === planet) {
        // Ship is a child of planet → set local coords directly
        cargoShip.position.copy(_shipPos);
        cargoShip.quaternion.copy(_localQuat);
    } else {
        // Ship is in world space → apply planet's transform manually
        _rotatedOffset.copy(_shipPos).applyQuaternion(planet.quaternion);
        cargoShip.position.copy(planet.position).add(_rotatedOffset);
        cargoShip.quaternion.copy(_localQuat).premultiply(planet.quaternion);
    }
}
