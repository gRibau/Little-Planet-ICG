/*
 * AI tools were integrated in project development and coding. The following were used:
 * * OpenAI. (2026). ChatGPT [Large language model]. https://chat.openai.com
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Import the model for testing here, for example:
// import { Satellite } from './vehicles.js'; 
import { createCity } from './objects/city.js';
import { createVolcano } from './objects/volcano.js';
import { createPyramid } from './objects/pyramid.js';
import { createTree } from './objects/tree.js';
import { createPalmTree } from './objects/palmTree.js';
import { createCargoShip } from './objects/cargoShip.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222); // Dark grey background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 10, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// Basic lighting to see the model clearly
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// A helper grid for the floor
const gridHelper = new THREE.GridHelper(60, 60);
scene.add(gridHelper);

// Add models here to test
// Example:
// const myTestModel = new Satellite();
// scene.add(myTestModel.mesh);

// Plane
// const plane = createPropellerPlane();
// scene.add(plane);

// Skyscraper
// const skyscraper = createSkyscraper();
// skyscraper.position.set(0, 0, 0);
// scene.add(skyscraper);

// City
// const city = createCity();
// scene.add(city);

// Volcano
// const volcano = createVolcano();
// scene.add(volcano);

// Pyramid
// const pyramid = createPyramid();
// scene.add(pyramid);

// Tree
// const tree = createTree();
// scene.add(tree);

// Palm tree
// const palmTree = createPalmTree();
// scene.add(palmTree);

// Cargo ship
const cargoShip = createCargoShip();
scene.add(cargoShip);

function animate() {
    requestAnimationFrame(animate);
    
    // You can test animations here too
    // if (myTestModel) myTestModel.rotation.y += 0.01;

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();