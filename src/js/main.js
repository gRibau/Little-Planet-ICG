import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPlanet, placeModelOnPlanet } from './objects/planet.js';
import { createSun } from './objects/sun.js';
import { createMoon } from './objects/moon.js';
import { createPropellerPlane } from './objects/propellerPlane.js';
import { createCity } from './objects/city.js';
import { createVolcano } from './objects/volcano.js';
import { createPyramid } from './objects/pyramid.js';
import { createTree } from './objects/tree.js';
import { createPalmTree } from './objects/palmTree.js';
import { createCargoShip } from './objects/cargoShip.js';
import { setupLighting } from './environment/lighting.js';
import { setupStars } from './environment/stars.js';
import { planetAndMoonAnimations } from './animations/planetAndMoon.js';
import { planeAnimations } from './animations/plane.js';
import { updateModelsWindowLighting } from './animations/windowLighting.js';
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

// Objects on planet
const city = createCity();
city.scale.setScalar(0.75);
placeModelOnPlanet(city, planet, {
    latitudeDeg: 2,
    longitudeDeg: 115,
    radius: 25,
    altitude: 0,
    yawDeg: 25
});
const cityBuildings = city.userData.buildings ?? [];

const volcano = createVolcano();
placeModelOnPlanet(volcano, planet, {
    latitudeDeg: 27,
    longitudeDeg: 220,
    radius: 25,
    altitude: 0.8,
    yawDeg: -15
});

const pyramid1 = createPyramid();
pyramid1.scale.setScalar(0.75);
placeModelOnPlanet(pyramid1, planet, {
    latitudeDeg: -10,
    longitudeDeg: 0,
    radius: 25,
    altitude: 0.75,
    yawDeg: 35
});

const pyramid2 = createPyramid();
pyramid2.scale.setScalar(0.55);
placeModelOnPlanet(pyramid2, planet, {
    latitudeDeg: -20,
    longitudeDeg: 10,
    radius: 25,
    altitude: 0.8,
    yawDeg: 35
});

const tree = createTree();
tree.scale.setScalar(1.5);
placeModelOnPlanet(tree, planet, {
    latitudeDeg: 17,
    longitudeDeg: 130,
    radius: 25,
    altitude: 0.8,
    yawDeg: -10
});

const palmTree = createPalmTree();
palmTree.scale.setScalar(0.8);
placeModelOnPlanet(palmTree, planet, {
    latitudeDeg: 10,
    longitudeDeg: -150,
    radius: 25,
    altitude: 0.6,
    yawDeg: 20
});

const cargoShip = createCargoShip();
cargoShip.scale.setScalar(0.6);
placeModelOnPlanet(cargoShip, planet, {
    latitudeDeg: -5,
    longitudeDeg: 160,
    radius: 25,
    altitude: 0.2,
    yawDeg: -40
});

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
    updateModelsWindowLighting(cityBuildings, planet, sun, {
        deltaTime,
        darkReach: 1 / 3,
        transitionSpeed: 1.0
    });
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
