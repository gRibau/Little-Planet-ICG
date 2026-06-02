import * as THREE from 'three';
import { applyPopAnimation } from '../utils/animations.js';

export const ufoState = {
    stage: 0, // 0: idle, 1: liftoff, 2: transit, 3: abduct, 4: depart, 5: wait, 6: pop-up
    timer: 0,
    initialized: false,
    
    // References
    ufo: null,
    cow: null,
    scene: null,
    planet: null,
    moon: null,

    // Initial transforms for reset
    ufoBaseScale: new THREE.Vector3(),
    ufoOriginalLocalPos: new THREE.Vector3(),
    ufoOriginalLocalQuat: new THREE.Quaternion(),
    
    cowBaseScale: new THREE.Vector3(),
    cowOriginalLocalPos: new THREE.Vector3(),
    cowOriginalLocalQuat: new THREE.Quaternion(),

    // Transit targets
    cowLocalHoverPos: new THREE.Vector3(),
    startWorldPos: new THREE.Vector3(),
    startWorldQuat: new THREE.Quaternion(),
    
    // Temps
    _worldTargetPos: new THREE.Vector3(),
    _worldTargetQuat: new THREE.Quaternion()
};

export function setupUFOInteraction(ufo, cow, scene, planet, moon, interactionManager) {
    if (!ufo || !cow) return;

    ufoState.ufo = ufo;
    ufoState.cow = cow;
    ufoState.scene = scene;
    ufoState.planet = planet;
    ufoState.moon = moon;

    // Save original states
    ufoState.ufoBaseScale.copy(ufo.scale);
    ufoState.ufoOriginalLocalPos.copy(ufo.position);
    ufoState.ufoOriginalLocalQuat.copy(ufo.quaternion);

    ufoState.cowBaseScale.copy(cow.scale);
    ufoState.cowOriginalLocalPos.copy(cow.position);
    ufoState.cowOriginalLocalQuat.copy(cow.quaternion);

    ufoState.initialized = true;

    interactionManager.add(ufo, {
        useCursor: true,
        onClick: () => {
            if (ufoState.stage === 0) {
                ufoState.stage = 1;
                ufoState.timer = 0;
            }
        }
    });
}

export function ufoAnimations(deltaTime) {
    if (!ufoState.initialized) return;

    const { ufo, cow, scene, planet, moon, _worldTargetPos, _worldTargetQuat } = ufoState;

    if (ufoState.stage === 0) {
        // Idle - nothing to do, UFO is attached to moon and cow to planet
        return;
    }

    ufoState.timer += deltaTime;

    if (ufoState.stage === 1) {
        // Liftoff from moon
        const duration = 1.0;
        const t = Math.min(ufoState.timer / duration, 1.0);

        if (ufoState.timer === deltaTime) { // First frame
            // Attach UFO to scene to decouple from moon rotation during flight
            scene.attach(ufo);
            ufoState.startWorldPos.copy(ufo.position);
        }

        // Lift off directly away from moon center
        const moonWorldPos = moon.getWorldPosition(new THREE.Vector3());
        const upDir = ufoState.startWorldPos.clone().sub(moonWorldPos).normalize();
        
        // Move up by 5 units
        ufo.position.copy(ufoState.startWorldPos).addScaledVector(upDir, t * 5.0);

        if (t >= 1.0) {
            ufoState.stage = 2;
            ufoState.timer = 0;
            ufoState.startWorldPos.copy(ufo.position);
            ufoState.startWorldQuat.copy(ufo.quaternion);
            
            // Calculate hover position directly above the cow (local to planet)
            const upFromPlanet = ufoState.cowOriginalLocalPos.clone().normalize();
            ufoState.cowLocalHoverPos.copy(ufoState.cowOriginalLocalPos).addScaledVector(upFromPlanet, 6.0); // Hover 6 units above
        }
    } 
    else if (ufoState.stage === 2) {
        // Transit to cow
        const duration = 2.0;
        const t = Math.min(ufoState.timer / duration, 1.0);
        
        // Smooth ease-in-out
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        // Dynamic world target based on rotating planet
        _worldTargetPos.copy(ufoState.cowLocalHoverPos).applyMatrix4(planet.matrixWorld);
        
        // Get planet center in world space
        const planetPos = planet.getWorldPosition(new THREE.Vector3());

        // 1. Compute start direction and distance from planet
        const startOffset = ufoState.startWorldPos.clone().sub(planetPos);
        const startRadius = startOffset.length();
        startOffset.normalize();

        // 2. Compute target direction and distance from planet
        const targetOffset = _worldTargetPos.clone().sub(planetPos);
        const targetRadius = targetOffset.length();
        targetOffset.normalize();

        // 3. Spherical interpolate direction
        const q = new THREE.Quaternion().setFromUnitVectors(startOffset, targetOffset);
        const currentQ = new THREE.Quaternion().slerp(q, easeT);
        const currentDir = startOffset.clone().applyQuaternion(currentQ);

        // 4. Linear interpolate distance
        const currentRadius = THREE.MathUtils.lerp(startRadius, targetRadius, easeT);

        // 5. Apply curved position
        ufo.position.copy(currentDir).multiplyScalar(currentRadius).add(planetPos);
        
        // Target rotation: match cow's orientation (but maybe spin?)
        planet.getWorldQuaternion(_worldTargetQuat);
        _worldTargetQuat.multiply(ufoState.cowOriginalLocalQuat);

        ufo.quaternion.slerpQuaternions(ufoState.startWorldQuat, _worldTargetQuat, easeT);

        // Spin the UFO saucer around its local Y axis for effect
        ufo.rotateY(deltaTime * 5.0);
        
        const abductionLight = ufo.getObjectByName('abductionLight');
        if (abductionLight) abductionLight.intensity = t * 10.0; // Fade in

        if (t >= 1.0) {
            ufoState.stage = 3;
            ufoState.timer = 0;
        }
    }
    else if (ufoState.stage === 3) {
        // Abduct Cow
        const duration = 1.5;
        const t = Math.min(ufoState.timer / duration, 1.0);
        const easeIn = t * t; // slow start, fast end

        // UFO hovers in place but tracks planet rotation
        _worldTargetPos.copy(ufoState.cowLocalHoverPos).applyMatrix4(planet.matrixWorld);
        planet.getWorldQuaternion(_worldTargetQuat);
        _worldTargetQuat.multiply(ufoState.cowOriginalLocalQuat);
        
        ufo.position.copy(_worldTargetPos);
        ufo.quaternion.copy(_worldTargetQuat);
        ufo.rotateY(deltaTime * 10.0); // Spin faster!

        // Cow moves straight up into UFO (both follow planet rotation perfectly)
        cow.position.lerpVectors(ufoState.cowOriginalLocalPos, ufoState.cowLocalHoverPos, easeIn);
        cow.scale.copy(ufoState.cowBaseScale).multiplyScalar(1.0 - easeIn);

        const abductionLight = ufo.getObjectByName('abductionLight');
        if (abductionLight) {
            // Pulse the light while sucking up cow
            abductionLight.intensity = 10.0 + Math.sin(t * Math.PI * 8) * 2.0;
        }

        if (t >= 1.0) {
            ufoState.stage = 4;
            ufoState.timer = 0;
            ufoState.startWorldPos.copy(ufo.position);
            cow.scale.set(0, 0, 0); // hide cow
        }
    }
    else if (ufoState.stage === 4) {
        // Depart into space
        const duration = 1.0;
        const t = Math.min(ufoState.timer / duration, 1.0);
        const easeIn = t * t * t;

        // Fly outward from planet
        const planetWorldPos = planet.getWorldPosition(new THREE.Vector3());
        const outDir = ufoState.startWorldPos.clone().sub(planetWorldPos).normalize();
        
        // Accelerate out 100 units
        ufo.position.copy(ufoState.startWorldPos).addScaledVector(outDir, easeIn * 100.0);
        
        // Shrink UFO into distance
        ufo.scale.copy(ufoState.ufoBaseScale).multiplyScalar(1.0 - t);
        ufo.rotateY(deltaTime * 15.0); // Spin super fast!
        
        const abductionLight = ufo.getObjectByName('abductionLight');
        if (abductionLight) abductionLight.intensity = 10.0 * (1.0 - t); // Fade out

        if (t >= 1.0) {
            ufoState.stage = 5;
            ufoState.timer = 0;
            ufo.scale.set(0, 0, 0);
        }
    }
    else if (ufoState.stage === 5) {
        // Wait period before resetting
        if (ufoState.timer >= 1.0) {
            ufoState.stage = 6;
            ufoState.timer = 0;

            // Reset parents and local transforms
            moon.attach(ufo);
            ufo.position.copy(ufoState.ufoOriginalLocalPos);
            ufo.quaternion.copy(ufoState.ufoOriginalLocalQuat);

            planet.attach(cow);
            cow.position.copy(ufoState.cowOriginalLocalPos);
            cow.quaternion.copy(ufoState.cowOriginalLocalQuat);
        }
    }
    else if (ufoState.stage === 6) {
        // Pop-up reappear
        const duration = 1.0;
        const t = Math.min(ufoState.timer / duration, 1.0);

        applyPopAnimation(ufo, ufoState.ufoBaseScale, t);
        applyPopAnimation(cow, ufoState.cowBaseScale, t);

        if (t >= 1.0) {
            ufoState.stage = 0; // Back to idle
        }
    }
}
