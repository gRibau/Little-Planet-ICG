import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPlanet } from './objects/planet.js';
import { createSun } from './objects/sun.js';
import { setupLighting } from './environment/lighting.js';
import { setupStars } from './environment/stars.js';

// Scene setup
const scene = new THREE.Scene();

// Setup Environment
setupStars(scene, 10000); // Adding 10,000 extra stars

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize Components
const planet = createPlanet();
scene.add(planet);

const sun = createSun();
scene.add(sun);

setupLighting(scene);

// Controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 50;   // Minimum zoom distance (planet radius is 5)
controls.maxDistance = 300; // Maximum zoom distance
camera.position.x = 100;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Automatic rotation
    planet.rotation.y += 0.005; 
    
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
