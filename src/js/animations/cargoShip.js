import * as THREE from 'three';
import { applyPopAnimation } from '../utils/animations.js';

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
const _tiltQuat = new THREE.Quaternion();
const _localX = new THREE.Vector3(1, 0, 0);

let shipElapsedTime = 0;

export const cargoShipState = {
    stage: 0, // 0: sailing, 1: sinking, 2: wait sunk, 3: appearing
    timer: 0,
    baseScale: new THREE.Vector3(),
    initialized: false
};

export function setupCargoShipInteraction(cargoShip, interactionManager) {
    if (!cargoShip) return;
    
    cargoShipState.baseScale.copy(cargoShip.scale);
    cargoShipState.initialized = true;

    interactionManager.add(cargoShip, {
        useCursor: true,
        onClick: () => {
            if (cargoShipState.stage === 0) {
                cargoShipState.stage = 1;
                cargoShipState.timer = 0;
            }
        }
    });
}

// =============================================
// Animation tick

export function cargoShipAnimations(cargoShip, planet, deltaTime = 1 / 60) {
    if (!cargoShip || !cargoShipState.initialized) return;

    let tiltAngle = 0;
    let sinkOffset = 0;

    if (cargoShipState.stage === 0) {
        shipElapsedTime += deltaTime;
    } else if (cargoShipState.stage === 1) {
        cargoShipState.timer += deltaTime;
        const duration = 2.0;
        const t = Math.min(cargoShipState.timer / duration, 1.0);
        
        // Ease-in for sinking
        const easeIn = t * t;
        tiltAngle = -easeIn * (Math.PI / 3); // Tilt 60 degrees back
        sinkOffset = -easeIn * 5.0;          // Sink 5 units down
        
        if (t >= 1.0) {
            cargoShipState.stage = 2;
            cargoShipState.timer = 0;
            cargoShip.scale.set(0, 0, 0); // Hide completely while sunk
        }
    } else if (cargoShipState.stage === 2) {
        cargoShipState.timer += deltaTime;
        tiltAngle = -(Math.PI / 3);
        sinkOffset = -5.0;
        
        if (cargoShipState.timer >= 1.0) { // Wait 1 second
            cargoShipState.stage = 3;
            cargoShipState.timer = 0;
            tiltAngle = 0;
            sinkOffset = 0;
            shipElapsedTime = 0;
        }
    } else if (cargoShipState.stage === 3) {
        cargoShipState.timer += deltaTime;
        const duration = 1.0;
        const t = Math.min(cargoShipState.timer / duration, 1.0);
        
        applyPopAnimation(cargoShip, cargoShipState.baseScale, t);
        
        if (t >= 1.0) {
            cargoShipState.stage = 0;
            cargoShip.scale.copy(cargoShipState.baseScale);
        }
    }

    const t = (shipElapsedTime / LOOP_DURATION) % 1.0;

    // 1. Sample the spline and project onto the water surface
    shipRoute.getPointAt(t, _shipPos);
    _shipPos.normalize().multiplyScalar(WATER_RADIUS - SHIP_SINK + sinkOffset);

    // 2. Surface normal = outward direction (same as placeModelOnPlanet uses)
    _up.copy(_shipPos).normalize();

    // 3. Travel direction: spline tangent projected onto the local tangent plane
    shipRoute.getTangentAt(t, _forward);
    _forward.addScaledVector(_up, -_forward.dot(_up)).normalize();

    // 4. Right vector completes the basis (Up × Forward for right-handed system)
    _right.crossVectors(_up, _forward).normalize();

    // 5. Build orientation quaternion (ship model: +X right, +Y up, +Z forward)
    _basisMatrix.makeBasis(_right, _up, _forward);
    _localQuat.setFromRotationMatrix(_basisMatrix);

    if (tiltAngle !== 0) {
        _tiltQuat.setFromAxisAngle(_localX, tiltAngle);
        _localQuat.multiply(_tiltQuat);
    }

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
