import * as THREE from 'three';

export const volcanoState = {
    stage: 0, // 0: idle, 1: erupting
    timer: 0,
    initialized: false,
    
    volcano: null,
    baseScale: new THREE.Vector3(),
    originalGlowIntensity: 0,

    lavaParticles: [],
    smokeParticles: [],
    
    particleGroup: null
};

export function setupVolcanoInteraction(volcano, interactionManager) {
    if (!volcano) return;

    volcanoState.volcano = volcano;
    volcanoState.baseScale.copy(volcano.scale);

    // Find the original glow light
    volcano.traverse((child) => {
        if (child.isPointLight) {
            volcanoState.originalGlowIntensity = child.intensity;
        }
    });

    volcanoState.particleGroup = new THREE.Group();
    volcano.add(volcanoState.particleGroup); // Attach to volcano so they inherit planet rotation

    volcanoState.initialized = true;

    interactionManager.add(volcano, {
        useCursor: true,
        onClick: () => {
            if (volcanoState.stage === 0) {
                startEruption();
            }
        }
    });
}

function startEruption() {
    volcanoState.stage = 1;
    volcanoState.timer = 0;

    // Clear old particles if any
    volcanoState.particleGroup.clear();
    volcanoState.lavaParticles = [];
    volcanoState.smokeParticles = [];

    const craterHeight = 3.6;

    // Create lava bombs
    const lavaGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const lavaMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6a22,
        emissive: 0xff3a00,
        emissiveIntensity: 2.0,
        roughness: 0.4
    });

    for (let i = 0; i < 40; i++) {
        const mesh = new THREE.Mesh(lavaGeometry, lavaMaterial);
        mesh.position.set(
            (Math.random() - 0.5) * 0.5, 
            craterHeight, 
            (Math.random() - 0.5) * 0.5
        );
        
        volcanoState.particleGroup.add(mesh);
        
        volcanoState.lavaParticles.push({
            mesh: mesh,
            vx: (Math.random() - 0.5) * 6.0,
            vy: 8.0 + Math.random() * 6.0,
            vz: (Math.random() - 0.5) * 6.0
        });
    }

    // Create smoke plumes
    const smokeGeometry = new THREE.SphereGeometry(0.5, 12, 12);
    const smokeMaterial = new THREE.MeshStandardMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.8,
        roughness: 1.0,
        depthWrite: false // Prevents sorting glitches between transparent spheres
    });

    for (let i = 0; i < 15; i++) {
        const mesh = new THREE.Mesh(smokeGeometry, smokeMaterial.clone()); // Clone so we can animate opacity individually
        mesh.position.set(
            (Math.random() - 0.5) * 1.0, 
            craterHeight + Math.random() * 0.5, 
            (Math.random() - 0.5) * 1.0
        );
        
        // Random base scale to make cloud look organic
        const s = 0.5 + Math.random() * 1.0;
        mesh.scale.set(s, s, s);
        
        volcanoState.particleGroup.add(mesh);
        
        volcanoState.smokeParticles.push({
            mesh: mesh,
            vx: (Math.random() - 0.5) * 1.0,
            vy: 2.0 + Math.random() * 2.0,
            vz: (Math.random() - 0.5) * 1.0,
            baseScale: s,
            life: Math.random() * 0.5 // Start with a random life offset so they don't all fade exactly identically
        });
    }
}

export function volcanoAnimations(deltaTime) {
    if (!volcanoState.initialized || volcanoState.stage === 0) return;

    volcanoState.timer += deltaTime;
    const { volcano, lavaParticles, smokeParticles, baseScale } = volcanoState;
    const duration = 4.0;
    
    const gravity = 25.0;

    // 1. Shaking & Lighting (first 1 second)
    let glowLight = null;
    volcano.traverse((child) => {
        if (child.isPointLight) glowLight = child;
    });

    if (volcanoState.timer < 1.0) {
        // Random scaling to simulate violent shaking
        const jitter = 1.0 + (Math.random() * 0.04 - 0.02); // +/- 2%
        volcano.scale.copy(baseScale).multiplyScalar(jitter);
        
        if (glowLight) {
            glowLight.intensity = volcanoState.originalGlowIntensity * (2.0 + Math.random() * 3.0); // Flicker super bright
        }
    } else {
        // Settle down
        volcano.scale.copy(baseScale);
        if (glowLight) {
            // Smoothly fade back to original intensity
            glowLight.intensity = THREE.MathUtils.lerp(glowLight.intensity, volcanoState.originalGlowIntensity, deltaTime * 5.0);
        }
    }

    // 2. Lava Bombs Physics
    lavaParticles.forEach(p => {
        if (p.mesh.position.y > 0) { // If still above ground
            p.mesh.position.x += p.vx * deltaTime;
            p.mesh.position.y += p.vy * deltaTime;
            p.mesh.position.z += p.vz * deltaTime;
            
            p.vy -= gravity * deltaTime;
            
            // Randomly spin rocks
            p.mesh.rotation.x += deltaTime * 5;
            p.mesh.rotation.y += deltaTime * 5;
        } else {
            // Hide them when they hit the base
            p.mesh.visible = false;
        }
    });

    // 3. Smoke Plume Animation
    smokeParticles.forEach(p => {
        p.life += deltaTime;
        const smokeT = Math.min(p.life / duration, 1.0);
        
        // Drift upwards and slightly outwards
        p.mesh.position.x += p.vx * deltaTime;
        p.mesh.position.y += p.vy * deltaTime;
        p.mesh.position.z += p.vz * deltaTime;
        
        // Scale up massive over time
        const currentScale = p.baseScale * (1.0 + smokeT * 6.0);
        p.mesh.scale.set(currentScale, currentScale, currentScale);
        
        // Fade out
        p.mesh.material.opacity = 0.8 * (1.0 - smokeT);
    });

    // 4. End Eruption
    if (volcanoState.timer >= duration) {
        volcanoState.stage = 0;
        volcanoState.timer = 0;
        volcano.scale.copy(baseScale);
        if (glowLight) glowLight.intensity = volcanoState.originalGlowIntensity;
        volcanoState.particleGroup.clear(); // Remove all particles to save memory
    }
}
