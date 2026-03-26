import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Planet creation
const geometry = new THREE.SphereGeometry(5, 64, 64);
const material = new THREE.MeshStandardMaterial({ color: 0x2244ff });
const planet = new THREE.Mesh(geometry, material);
scene.add(planet);

// Sun (Directional Light)
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(10, 10, 10); // Position it based on your sketch
scene.add(sunLight);

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

animate();