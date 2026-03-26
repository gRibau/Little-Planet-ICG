import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPlanet } from './objects/planet.js';
import { setupLighting } from './environment/lighting.js';
import { setupSkybox } from './environment/skybox.js';

// Scene setup
const scene = new THREE.Scene();

// Setup Skybox (using a physical sphere for better scale)
setupSkybox(scene, 'assets/environment/space.png');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Initialize Components
const planet = createPlanet();
scene.add(planet);

setupLighting(scene);

// Controls for mouse interaction
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 15;

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
