import * as THREE from 'three';

export const satelliteState = {
    stage: 0, // 0: idle, 1: firing, 2: explosion, 3: blackout, 4: reset
    timer: 0,
    initialized: false,
    
    satellite: null,
    planet: null,
    scene: null,

    laser: null,
    explosion: null,
    blackoutDiv: null
};

export function setupSatelliteInteraction(satellite, planet, scene, interactionManager) {
    if (!satellite || !planet) return;

    satelliteState.satellite = satellite;
    satelliteState.planet = planet;
    satelliteState.scene = scene;

    // Create the laser beam (Cylinder)
    const laserGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    // Rotate geometry so it aligns with the Z axis (makes lookAt work easily)
    laserGeometry.rotateX(Math.PI / 2);
    const laserMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00, 
        transparent: true, 
        opacity: 0.8 
    });
    satelliteState.laser = new THREE.Mesh(laserGeometry, laserMaterial);
    satelliteState.laser.visible = false;
    scene.add(satelliteState.laser);

    // Create the explosion sphere
    const explosionGeometry = new THREE.SphereGeometry(25, 32, 32);
    const explosionMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff3300,
        transparent: true,
        opacity: 0.9
    });
    satelliteState.explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);
    satelliteState.explosion.visible = false;
    scene.add(satelliteState.explosion);

    // Create the blackout div
    satelliteState.blackoutDiv = document.createElement('div');
    satelliteState.blackoutDiv.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: black; z-index: 9999; pointer-events: none;
        opacity: 0; transition: opacity 0.5s ease-in-out;
    `;
    document.body.appendChild(satelliteState.blackoutDiv);

    satelliteState.initialized = true;

    interactionManager.add(satellite, {
        useCursor: true,
        onClick: () => {
            if (satelliteState.stage === 0) {
                satelliteState.stage = 1;
                satelliteState.timer = 0;
                satellite.userData.isFiring = true; // Halts orbit
            }
        }
    });
}

export function satelliteAnimations(deltaTime) {
    if (!satelliteState.initialized || satelliteState.stage === 0) return;

    const { satellite, planet, laser, explosion, blackoutDiv } = satelliteState;
    satelliteState.timer += deltaTime;

    const satPos = satellite.getWorldPosition(new THREE.Vector3());
    const planetPos = planet.getWorldPosition(new THREE.Vector3());

    if (satelliteState.stage === 1) {
        // Firing Laser
        const duration = 1.0;
        const t = Math.min(satelliteState.timer / duration, 1.0);

        if (!laser.visible) {
            laser.visible = true;
        }

        // Position the laser exactly halfway between the satellite and the planet
        const midPoint = new THREE.Vector3().lerpVectors(satPos, planetPos, 0.5);
        laser.position.copy(midPoint);

        // Make the laser point from the satellite to the planet
        laser.lookAt(planetPos);

        // Scale the laser to stretch exactly the distance between them
        const distance = satPos.distanceTo(planetPos);
        laser.scale.set(1 + Math.sin(t * Math.PI * 10) * 0.5, 1 + Math.sin(t * Math.PI * 10) * 0.5, distance); // Pulsing thickness

        if (t >= 1.0) {
            satelliteState.stage = 2;
            satelliteState.timer = 0;
            laser.visible = false; // Turn off laser
        }
    } 
    else if (satelliteState.stage === 2) {
        // Explosion Expanding
        const duration = 1.5;
        const t = Math.min(satelliteState.timer / duration, 1.0);
        
        if (!explosion.visible) {
            explosion.visible = true;
            explosion.position.copy(planetPos);
        }

        // Scale up massively to swallow the camera
        const scale = 1.0 + Math.pow(t, 4) * 20.0; 
        explosion.scale.set(scale, scale, scale);
        explosion.material.color.setHex(0xff3300).lerp(new THREE.Color(0xffffff), t * t); // Turns white-hot

        // Start blackout early so it finishes fading when scale is ~2.0
        if (t > 0.15 && blackoutDiv.style.opacity === '0') {
            blackoutDiv.style.opacity = '1';
        }

        if (t >= 1.0) {
            satelliteState.stage = 3;
            satelliteState.timer = 0;
        }
    }
    else if (satelliteState.stage === 3) {
        // Wait briefly while screen is fully black
        const duration = 0.5;

        if (satelliteState.timer >= duration) {
            satelliteState.stage = 4;
            satelliteState.timer = 0;
        }
    }
    else if (satelliteState.stage === 4) {
        // Reset state
        explosion.visible = false;
        explosion.scale.set(1, 1, 1);
        explosion.material.color.setHex(0xff3300);
        
        satellite.userData.isFiring = false; // Resumes orbit
        
        // Wait briefly while screen is black, then fade out
        if (satelliteState.timer > 0.5) {
            blackoutDiv.style.opacity = '0';
            satelliteState.stage = 0; // Back to idle
            satelliteState.timer = 0;
        }
    }
}
