import * as THREE from 'three';

/**
 * Lat/Lon Helper — hover over the planet or moon to see coordinates.
 * Collapsible panel that slides in from the right edge.
 */
export function setupLatLonHelper(camera, renderer, targets) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let enabled = false;
    let collapsed = true;

    // =============================================
    // UI

    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; top: 12px; right: 0; z-index: 1000;
        font-family: 'Segoe UI', system-ui, sans-serif;
        user-select: none; display: flex; align-items: flex-start;
    `;

    // --- Toggle tab (always visible, sticks to the right edge) ---
    const tab = document.createElement('div');
    tab.style.cssText = `
        background: rgba(0,0,0,0.7); color: #fff; padding: 8px 6px;
        cursor: pointer; font-size: 10px; border: 1px solid rgba(255,255,255,0.15);
        border-right: none; border-radius: 4px 0 0 4px;
        display: flex; align-items: center; writing-mode: vertical-lr;
    `;

    const arrow = document.createElement('span');
    arrow.textContent = '◀';
    arrow.style.cssText = 'transition: transform 0.2s;';

    tab.appendChild(arrow);

    // --- Panel (slides in/out) ---
    const panel = document.createElement('div');
    panel.style.cssText = `
        background: rgba(0,0,0,0.7); color: #fff;
        padding: 10px 14px; font-size: 13px; line-height: 1.6;
        border: 1px solid rgba(255,255,255,0.15); border-right: none;
        min-width: 180px; display: none;
    `;

    const title = document.createElement('div');
    title.textContent = 'Dev Tools';
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px; font-size: 13px;';

    // Checkbox row
    const checkboxRow = document.createElement('label');
    checkboxRow.style.cssText = `
        display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 2px 0;
    `;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.style.cssText = `
        appearance: none; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.5);
        border-radius: 2px; background: transparent; cursor: pointer; flex-shrink: 0;
    `;

    const checkLabel = document.createElement('span');
    checkLabel.textContent = 'Lat/Lon Helper';

    checkboxRow.appendChild(checkbox);
    checkboxRow.appendChild(checkLabel);

    // Readout area
    const readout = document.createElement('div');
    readout.style.cssText = `
        display: none; margin-top: 8px; padding-top: 8px;
        border-top: 1px solid rgba(255,255,255,0.1);
        font-variant-numeric: tabular-nums;
    `;
    readout.innerHTML = '<span style="color:#666">Hover over planet/moon…</span>';

    panel.appendChild(title);
    panel.appendChild(checkboxRow);
    panel.appendChild(readout);

    container.appendChild(panel);
    container.appendChild(tab);
    document.body.appendChild(container);

    // =============================================
    // Interactions

    tab.addEventListener('click', () => {
        collapsed = !collapsed;
        panel.style.display = collapsed ? 'none' : 'block';
        arrow.textContent = collapsed ? '◀' : '▶';
    });

    checkbox.addEventListener('change', () => {
        enabled = checkbox.checked;
        checkbox.style.background = enabled ? '#4a9eff' : 'transparent';
        checkbox.style.borderColor = enabled ? '#4a9eff' : 'rgba(255,255,255,0.5)';
        readout.style.display = enabled ? 'block' : 'none';
        if (!enabled) {
            readout.innerHTML = '<span style="color:#666">Hover over planet/moon…</span>';
        }
    });

    // =============================================
    // Raycasting on mouse move

    renderer.domElement.addEventListener('mousemove', (event) => {
        if (!enabled) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        for (const target of targets) {
            const intersects = raycaster.intersectObject(target.mesh, false);
            if (intersects.length > 0) {
                const hit = intersects[0].point;
                const localHit = target.mesh.worldToLocal(hit.clone()).normalize();

                const lat = THREE.MathUtils.radToDeg(Math.asin(localHit.y));
                const lon = THREE.MathUtils.radToDeg(Math.atan2(localHit.z, localHit.x));

                readout.innerHTML = `
                    <div style="color:#8cf; font-weight:600; margin-bottom:2px">${target.label}</div>
                    <div>Lat: <b>${lat.toFixed(1)}°</b></div>
                    <div>Lon: <b>${lon.toFixed(1)}°</b></div>
                `;
                return;
            }
        }

        readout.innerHTML = '<span style="color:#666">Hover over planet/moon…</span>';
    });

    return {
        isEnabled: () => enabled
    };
}
