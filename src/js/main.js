import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPlanet, placeModelOnPlanet } from './objects/planet.js';
import { createSun } from './objects/sun.js';
import { createMoon, placeModelOnMoon } from './objects/moon.js';
import { createUFO } from './objects/ufo.js';
import { createSatellite } from './objects/satellite.js';
import { createPropellerPlane } from './objects/propellerPlane.js';
import { createCity } from './objects/city.js';
import { createVolcano } from './objects/volcano.js';
import { createPyramid } from './objects/pyramid.js';
import { createTree } from './objects/tree.js';
import { createPalmTree } from './objects/palmTree.js';
import { createCargoShip } from './objects/cargoShip.js';
import { createCow } from './objects/cow.js';
import { createSettlement } from './objects/settlement.js';

import { setupLighting } from './environment/lighting.js';
import { setupStars } from './environment/stars.js';
import { planetAndMoonAnimations } from './animations/planetAndMoon.js';
import { planeAnimations } from './animations/plane.js';
import { updateModelsWindowLighting } from './animations/windowLighting.js';
import { cargoShipAnimations } from './animations/cargoShip.js';
import { setupPlaneInteraction } from './interactions/plane.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// ================================================================
// Initial Setup

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


// ================================================================
// Astral Bodies

// Initialize Planet
const planet = createPlanet();
scene.add(planet);

const sun = createSun();
scene.add(sun);
const sunOffset = sun.position.clone();

const moon = createMoon();
scene.add(moon);


// =============================================
// Objects on planet

// =======================
// Main Models
const city = createCity();
city.scale.setScalar(0.75);
placeModelOnPlanet(city, planet, {
    latitudeDeg: 2,
    longitudeDeg: 115,
    radius: 25,
    altitude: -0.7,
    yawDeg: 25
});
const cityBuildings = city.userData.buildings ?? [];

const volcano = createVolcano();
placeModelOnPlanet(volcano, planet, {
    latitudeDeg: 27,
    longitudeDeg: 220,
    radius: 25,
    altitude: 0.2,
    yawDeg: -15
});

const pyramid1 = createPyramid();
pyramid1.scale.setScalar(0.75);
placeModelOnPlanet(pyramid1, planet, {
    latitudeDeg: -10,
    longitudeDeg: 0,
    radius: 25,
    altitude: 0.2,
    yawDeg: 35
});

const pyramid2 = createPyramid();
pyramid2.scale.setScalar(0.55);
placeModelOnPlanet(pyramid2, planet, {
    latitudeDeg: -20,
    longitudeDeg: 10,
    radius: 25,
    altitude: 0.2,
    yawDeg: 35
});

const cargoShip = createCargoShip();
cargoShip.scale.setScalar(0.6);
scene.add(cargoShip);

const cow = createCow();
cow.scale.setScalar(0.5);
placeModelOnPlanet(cow, planet, {
    latitudeDeg: -35,
    longitudeDeg: -35,
    radius: 25,
    altitude: 0.5,
    yawDeg: 45
});

const settlement = createSettlement();
settlement.scale.setScalar(0.7);
placeModelOnPlanet(settlement, planet, {
    latitudeDeg: 10,
    longitudeDeg: -152,
    radius: 25,
    altitude: 0.3,
    yawDeg: 130
});


const plane = createPropellerPlane();
plane.scale.setScalar(0.7);
scene.add(plane);

// =======================
// Trees

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
palmTree.scale.setScalar(0.6);
placeModelOnPlanet(palmTree, planet, {
    latitudeDeg: 12,
    longitudeDeg: -140,
    radius: 25,
    altitude: 0.4,
    yawDeg: 20
});

const palmTree2 = createPalmTree();
palmTree2.scale.setScalar(0.6);
placeModelOnPlanet(palmTree2, planet, {
    latitudeDeg: 45,
    longitudeDeg: -130,
    radius: 25,
    altitude: 0.2,
    yawDeg: -15
});

const palmTree3 = createPalmTree();
palmTree3.scale.setScalar(0.6);
placeModelOnPlanet(palmTree3, planet, {
    latitudeDeg: 30,
    longitudeDeg: -160,
    radius: 25,
    altitude: 0.2,
    yawDeg: 45
});


// =============================================
// Objects on moon

// Create a UFO and place it on the moon back side
const ufo = createUFO();
ufo.scale.setScalar(0.9);
placeModelOnMoon(ufo, moon, {
    latitudeDeg: 0,
    longitudeDeg: 180,
    radius: 7,
    altitude: 0.5,
    yawDeg: 0,
    alignToNormal: true
});

const satellite = createSatellite();
satellite.scale.setScalar(1.8);
scene.add(satellite);


// ================================================================
// Final Setup

setupLighting(scene);

// Controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false; // Disable right-click camera translation
controls.minDistance = 50;   // Minimum zoom distance (planet radius is 25)
controls.maxDistance = 400; // Maximum zoom distance
camera.position.x = 150;

const planeInteraction = setupPlaneInteraction(camera, renderer, controls, planet, plane);
const clock = new THREE.Clock();


// =============================================
// Animation loop

function animate() {
    requestAnimationFrame(animate);
    const deltaTime = Math.min(clock.getDelta(), 0.05);

    // Keep background elements centered around the camera.
    starField.position.copy(camera.position);
    sun.position.copy(camera.position).add(sunOffset);

    // Call the external animation logic
    planetAndMoonAnimations(planet, moon, satellite);
    updateModelsWindowLighting(cityBuildings, planet, sun, {
        deltaTime,
        darkReach: 1 / 3,
        transitionSpeed: 1.0
    });
    planeInteraction.updateControls(deltaTime);
    planeAnimations(planet, plane, deltaTime);
    cargoShipAnimations(cargoShip, planet, deltaTime);
    planeInteraction.updateCamera(deltaTime);

    if (controls.enabled) {
        controls.update();
    }
    renderer.render(scene, camera);
}


// =============================================
// Handle window resize

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// =======================
// Run animate loop

animate();
