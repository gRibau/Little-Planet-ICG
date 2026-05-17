import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const _loader = new GLTFLoader();

/**
 * Creates an empty Group immediately, then asynchronously loads Cow.glb
 * and adds the model into the group. This allows the group to be placed
 * on the planet right away while the model streams in.
 */
export function createCow() {
    const cowGroup = new THREE.Group();

    const cowUrl = new URL('../../assets/models/Cow.glb', import.meta.url).href;

    _loader.load(
        cowUrl,
        (gltf) => {
            const model = gltf.scene;

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            cowGroup.add(model);
        },
        undefined,
        (error) => {
            console.error('Failed to load Cow.glb:', error);
        }
    );

    return cowGroup;
}
