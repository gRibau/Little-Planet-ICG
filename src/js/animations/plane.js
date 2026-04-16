import * as THREE from 'three';

const planeOrbitRadius = 35;
const defaultPlaneAngularSpeed = 0.7;
const maxPlaneAngularSpeed = 2.4;
const minPlaneAngularSpeed = 0.35;
const planeSpeedBaseRate = 1.6;
const planeSpeedRampRate = 2.2;
const planeTurnRate = 1.9;

let planeAngularSpeed = defaultPlaneAngularSpeed;
let radialOut = new THREE.Vector3(1, 0, 0);
let planeForward = new THREE.Vector3(0, 0, -1);
let planeStateInitialized = false;
let speedInputDirection = 0;
let speedInputHoldTime = 0;
let lastAppliedSpeedRate = planeSpeedBaseRate;

function initializePlaneState(planet, plane) {
    if (planeStateInitialized) {
        return;
    }

    const fromPlanet = plane.position.clone().sub(planet.position);
    if (fromPlanet.lengthSq() > 0.0001) {
        radialOut.copy(fromPlanet.normalize());
    }

    const worldForward = new THREE.Vector3(1, 0, 0).applyQuaternion(plane.quaternion);
    const projectedForward = worldForward.sub(radialOut.clone().multiplyScalar(worldForward.dot(radialOut)));

    if (projectedForward.lengthSq() > 0.0001) {
        planeForward.copy(projectedForward.normalize());
    } else {
        planeForward.copy(new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), radialOut).normalize());
    }

    planeStateInitialized = true;
}

export function updatePlaneControls(inputState, deltaTime) {
    const accelerate = inputState?.accelerate ?? false;
    const brake = inputState?.brake ?? false;
    const turnLeft = inputState?.turnLeft ?? false;
    const turnRight = inputState?.turnRight ?? false;

    const requestedSpeedDirection = (accelerate ? 1 : 0) - (brake ? 1 : 0);

    if (requestedSpeedDirection !== 0) {
        if (requestedSpeedDirection !== speedInputDirection) {
            speedInputHoldTime = 0;
            speedInputDirection = requestedSpeedDirection;
        } else {
            speedInputHoldTime += deltaTime;
        }

        const speedRate = planeSpeedBaseRate + speedInputHoldTime * planeSpeedRampRate;
        lastAppliedSpeedRate = speedRate;
        planeAngularSpeed += requestedSpeedDirection * speedRate * deltaTime;
        planeAngularSpeed = THREE.MathUtils.clamp(planeAngularSpeed, minPlaneAngularSpeed, maxPlaneAngularSpeed);
    } else {
        speedInputDirection = 0;
        speedInputHoldTime = 0;

        const speedDeltaToDefault = defaultPlaneAngularSpeed - planeAngularSpeed;
        if (Math.abs(speedDeltaToDefault) > 0.0001) {
            const settleDirection = Math.sign(speedDeltaToDefault);
            const settleStep = settleDirection * lastAppliedSpeedRate * deltaTime;

            if (Math.abs(settleStep) >= Math.abs(speedDeltaToDefault)) {
                planeAngularSpeed = defaultPlaneAngularSpeed;
            } else {
                planeAngularSpeed += settleStep;
            }
        } else {
            planeAngularSpeed = defaultPlaneAngularSpeed;
            lastAppliedSpeedRate = planeSpeedBaseRate;
        }
    }

    const turnInput = (turnLeft ? 1 : 0) - (turnRight ? 1 : 0);
    if (turnInput !== 0) {
        planeForward.applyAxisAngle(radialOut, turnInput * planeTurnRate * deltaTime).normalize();
    }
}

export function resetPlaneSpeed() {
    planeAngularSpeed = defaultPlaneAngularSpeed;
    speedInputDirection = 0;
    speedInputHoldTime = 0;
    lastAppliedSpeedRate = planeSpeedBaseRate;
}

export function planeAnimations(planet, plane, deltaTime = 1 / 60) {
    initializePlaneState(planet, plane);

    const angularStep = planeAngularSpeed * deltaTime;
    radialOut.addScaledVector(planeForward, angularStep).normalize();

    planeForward.addScaledVector(radialOut, -planeForward.dot(radialOut)).normalize();

    const planeX = radialOut.x * planeOrbitRadius;
    const planeY = radialOut.y * planeOrbitRadius;
    const planeZ = radialOut.z * planeOrbitRadius;

    const planeUp = radialOut;
    const planeRight = new THREE.Vector3().crossVectors(planeForward, planeUp).normalize();
    const planeOrientation = new THREE.Matrix4().makeBasis(planeForward, planeUp, planeRight);

    plane.position.set(planet.position.x + planeX, planet.position.y + planeY, planet.position.z + planeZ);
    plane.quaternion.setFromRotationMatrix(planeOrientation);

    if (plane.userData.propeller) {
        plane.userData.propeller.rotation.x += 0.25 + planeAngularSpeed * 0.2;
    }
}