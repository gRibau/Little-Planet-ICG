import * as THREE from 'three';

const planeOrbitRadius = 35;
const defaultPlaneAngularSpeed = 0.7;
const maxPlaneAngularSpeed = 1.2;
const minPlaneAngularSpeed = 0.175;
const planeSpeedBaseRate = 0.8;
const planeSpeedRampRate = 1.1;
const planeTurnRate = 1.15;

const maxPlanePitchAngle = THREE.MathUtils.degToRad(14);
const maxPlaneRollAngle = THREE.MathUtils.degToRad(26);
const maxLateralOffset = 6;
const maxVerticalOffset = 4;
const lateralOffsetRate = 6;
const verticalOffsetRate = 5;
const pitchFromVerticalVelocity = 0.055;
const rollFromLateralVelocity = 0.11;
const tiltResponseSpeed = 4;
const verticalVelocityTiltDeadzone = 0.05;

let planeAngularSpeed = defaultPlaneAngularSpeed;
let radialOut = new THREE.Vector3(1, 0, 0);
let planeForward = new THREE.Vector3(0, 0, -1);
let planeStateInitialized = false;
let speedInputDirection = 0;
let speedInputHoldTime = 0;
let lastAppliedSpeedRate = planeSpeedBaseRate;

let laneOffsetRight = 0;
let laneOffsetUp = 0;
let targetLaneOffsetRight = 0;
let targetLaneOffsetUp = 0;
let planePitchVisualAngle = 0;
let planeRollVisualAngle = 0;

const orientedForward = new THREE.Vector3();
const orientedUp = new THREE.Vector3();
const orientedRight = new THREE.Vector3();
const basePosition = new THREE.Vector3();
const planeOffset = new THREE.Vector3();
const velocityRight = new THREE.Vector3();
const velocityUp = new THREE.Vector3();
const cameraAnchorQuaternion = new THREE.Quaternion();
const pitchQuaternion = new THREE.Quaternion();
const rollQuaternion = new THREE.Quaternion();
const _planeOrientation = new THREE.Matrix4();

function moveToward(currentValue, targetValue, maxStep) {
    if (Math.abs(targetValue - currentValue) <= maxStep) {
        return targetValue;
    }

    return currentValue + Math.sign(targetValue - currentValue) * maxStep;
}

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
    const dip = inputState?.dip ?? false;
    const rise = inputState?.rise ?? false;
    const tiltLeft = inputState?.tiltLeft ?? false;
    const tiltRight = inputState?.tiltRight ?? false;

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

    // Up arrow dips and Down arrow rises, as requested.
    targetLaneOffsetUp = ((rise ? 1 : 0) - (dip ? 1 : 0)) * maxVerticalOffset;
    targetLaneOffsetRight = ((tiltRight ? 1 : 0) - (tiltLeft ? 1 : 0)) * maxLateralOffset;
}

export function resetPlaneSpeed() {
    planeAngularSpeed = defaultPlaneAngularSpeed;
    speedInputDirection = 0;
    speedInputHoldTime = 0;
    lastAppliedSpeedRate = planeSpeedBaseRate;

    laneOffsetRight = 0;
    laneOffsetUp = 0;
    targetLaneOffsetRight = 0;
    targetLaneOffsetUp = 0;
    planePitchVisualAngle = 0;
    planeRollVisualAngle = 0;
}

export function planeAnimations(planet, plane, deltaTime = 1 / 60) {
    initializePlaneState(planet, plane);

    const angularStep = planeAngularSpeed * deltaTime;
    radialOut.addScaledVector(planeForward, angularStep).normalize();
    planeForward.addScaledVector(radialOut, -planeForward.dot(radialOut)).normalize();

    const planeX = radialOut.x * planeOrbitRadius;
    const planeY = radialOut.y * planeOrbitRadius;
    const planeZ = radialOut.z * planeOrbitRadius;

    const previousOffsetRight = laneOffsetRight;
    const previousOffsetUp = laneOffsetUp;

    const lateralT = 1 - Math.exp(-lateralOffsetRate * deltaTime);
    const verticalT = 1 - Math.exp(-verticalOffsetRate * deltaTime);
    laneOffsetRight = THREE.MathUtils.lerp(laneOffsetRight, targetLaneOffsetRight, lateralT);
    laneOffsetUp = THREE.MathUtils.lerp(laneOffsetUp, targetLaneOffsetUp, verticalT);

    const offsetRightVelocity = (laneOffsetRight - previousOffsetRight) / Math.max(deltaTime, 0.0001);
    const offsetUpVelocity = (laneOffsetUp - previousOffsetUp) / Math.max(deltaTime, 0.0001);
    const pitchVelocity = Math.abs(offsetUpVelocity) < verticalVelocityTiltDeadzone ? 0 : offsetUpVelocity;
    const targetPitchAngle = THREE.MathUtils.clamp(pitchVelocity * pitchFromVerticalVelocity, -maxPlanePitchAngle, maxPlanePitchAngle);
    const targetRollAngle = THREE.MathUtils.clamp(offsetRightVelocity * rollFromLateralVelocity, -maxPlaneRollAngle, maxPlaneRollAngle);
    const tiltT = 1 - Math.exp(-tiltResponseSpeed * deltaTime);
    planePitchVisualAngle = THREE.MathUtils.lerp(planePitchVisualAngle, targetPitchAngle, tiltT);
    planeRollVisualAngle = THREE.MathUtils.lerp(planeRollVisualAngle, targetRollAngle, tiltT);

    orientedForward.copy(planeForward);
    orientedUp.copy(radialOut);
    orientedRight.crossVectors(orientedForward, orientedUp).normalize();

    pitchQuaternion.setFromAxisAngle(orientedRight, planePitchVisualAngle);
    orientedForward.applyQuaternion(pitchQuaternion).normalize();
    orientedUp.applyQuaternion(pitchQuaternion).normalize();
    orientedRight.crossVectors(orientedForward, orientedUp).normalize();

    rollQuaternion.setFromAxisAngle(orientedForward, planeRollVisualAngle);
    orientedRight.applyQuaternion(rollQuaternion).normalize();
    orientedUp.applyQuaternion(rollQuaternion).normalize();

    _planeOrientation.makeBasis(orientedForward, orientedUp, orientedRight);
    cameraAnchorQuaternion.setFromRotationMatrix(_planeOrientation);

    basePosition.set(planet.position.x + planeX, planet.position.y + planeY, planet.position.z + planeZ);
    velocityRight.copy(orientedRight).multiplyScalar(laneOffsetRight);
    velocityUp.copy(orientedUp).multiplyScalar(laneOffsetUp);
    planeOffset.copy(velocityRight).add(velocityUp);

    plane.position.copy(basePosition).add(planeOffset);
    plane.quaternion.setFromRotationMatrix(_planeOrientation);

    if (!plane.userData.cameraAnchorPosition) {
        plane.userData.cameraAnchorPosition = new THREE.Vector3();
    }
    if (!plane.userData.cameraAnchorQuaternion) {
        plane.userData.cameraAnchorQuaternion = new THREE.Quaternion();
    }

    plane.userData.cameraAnchorPosition.copy(basePosition);
    plane.userData.cameraAnchorQuaternion.copy(cameraAnchorQuaternion);

    if (plane.userData.propeller) {
        plane.userData.propeller.rotation.x += 0.25 + planeAngularSpeed * 0.2;
    }
}
