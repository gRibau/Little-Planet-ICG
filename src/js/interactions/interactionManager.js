import * as THREE from 'three';

export function setupInteractionManager(camera, renderer, controls = null) {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const interactables = [];
    let hoveredItem = null;

    function updatePointerFromEvent(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function handlePointerMove(event) {
        updatePointerFromEvent(event);
        raycaster.setFromCamera(pointer, camera);

        let hitInteractable = null;

        for (const item of interactables) {
            const hits = raycaster.intersectObject(item.object, true);
            if (hits.length > 0) {
                hitInteractable = item;
                break; // Stop at first hit
            }
        }

        if (hoveredItem !== hitInteractable) {
            if (hoveredItem) {
                if (hoveredItem.onHoverLeave) hoveredItem.onHoverLeave();
                if (hoveredItem.useCursor) renderer.domElement.style.cursor = 'default';
                if (controls && hoveredItem.disableControls) controls.enableRotate = true;
            }

            hoveredItem = hitInteractable;

            if (hoveredItem) {
                if (hoveredItem.onHoverEnter) hoveredItem.onHoverEnter();
                if (hoveredItem.useCursor) renderer.domElement.style.cursor = 'pointer';
                if (controls && hoveredItem.disableControls) controls.enableRotate = false;
            }
        }
    }

    function handlePointerDown(event) {
        updatePointerFromEvent(event);
        raycaster.setFromCamera(pointer, camera);

        let clickedAny = false;

        for (const item of interactables) {
            const hits = raycaster.intersectObject(item.object, true);
            if (hits.length > 0) {
                if (item.onClick) item.onClick(event);
                if (item.stopPropagation) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                clickedAny = true;
                break;
            }
        }

        if (!clickedAny) {
            for (const item of interactables) {
                if (item.onClickMissed) item.onClickMissed(event);
            }
        }
    }

    function handlePointerLeave() {
        if (hoveredItem) {
            if (hoveredItem.onHoverLeave) hoveredItem.onHoverLeave();
            if (hoveredItem.useCursor) renderer.domElement.style.cursor = 'default';
            if (controls && hoveredItem.disableControls) controls.enableRotate = true;
            hoveredItem = null;
        }
    }

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown, true);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    return {
        add(object, options = {}) {
            interactables.push({
                object,
                onHoverEnter: options.onHoverEnter,
                onHoverLeave: options.onHoverLeave,
                onClick: options.onClick,
                onClickMissed: options.onClickMissed,
                useCursor: options.useCursor !== false,
                disableControls: options.disableControls === true,
                stopPropagation: options.stopPropagation !== false
            });
        },
        dispose() {
            renderer.domElement.removeEventListener('pointermove', handlePointerMove);
            renderer.domElement.removeEventListener('pointerdown', handlePointerDown, true);
            renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
        }
    };
}
