import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPlanet } from './objects/planet.js';
import { createSun } from './objects/sun.js';
import { createMoon } from './objects/moon.js';
import { createPropellerPlane } from './objects/propellerPlane.js';
import { setupLighting } from './environment/lighting.js';
import { setupStars } from './environment/stars.js';
import { planetAndMoonAnimations } from './animations/planetAndMoon.js';
import { planeAnimations } from './animations/plane.js';
import { setupPlaneInteraction } from './interactions/plane.js';

// Scene setup
const scene = new THREE.Scene();

// Setup Environment
const starField = setupStars(scene, 10000); // Adding 10,000 extra stars

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize Components
const planet = createPlanet();
scene.add(planet);

const sun = createSun();
scene.add(sun);
const sunOffset = sun.position.clone();

const moon = createMoon();
scene.add(moon);

const plane = createPropellerPlane();
plane.scale.setScalar(0.7);
scene.add(plane);

setupLighting(scene);

// Controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; // Disable right-click camera translation
controls.minDistance = 50;   // Minimum zoom distance (planet radius is 25)
controls.maxDistance = 400; // Maximum zoom distance
camera.position.x = 150;

const planeInteraction = setupPlaneInteraction(camera, renderer, controls, planet, plane);
const clock = new THREE.Clock();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = Math.min(clock.getDelta(), 0.05);

    // Keep background elements centered around the camera.
    starField.position.copy(camera.position);
    sun.position.copy(camera.position).add(sunOffset);
    
    // Call the external animation logic
    planetAndMoonAnimations(planet, moon);
    planeInteraction.updateControls(deltaTime);
    planeAnimations(planet, plane, deltaTime);
    planeInteraction.updateCamera(deltaTime);
    
    if (controls.enabled) {
        controls.update();
    }
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
