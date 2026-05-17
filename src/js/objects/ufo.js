import * as THREE from 'three';

export function createUFO() {
    const ufo = new THREE.Group();

    // Main hull material - brushed metallic silver
    const hullMaterial = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.35,
        metalness: 0.85
    });

    // Dark hull material - for underside and details
    const darkMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.5,
        metalness: 0.4
    });

    // Dome material - dark glass-like cockpit
    const domeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.15,
        metalness: 0.6,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.2
    });

    // Main saucer body - very flat and wide
    const saucerGeometry = new THREE.SphereGeometry(3.5, 48, 24);
    const saucer = new THREE.Mesh(saucerGeometry, hullMaterial);
    saucer.scale.set(1, 0.15, 1);  // Much flatter
    ufo.add(saucer);

    // Saucer rim - raised edge
    const rimTorus = new THREE.Mesh(
        new THREE.TorusGeometry(3.6, 0.2, 16, 64),
        hullMaterial
    );
    // rotate rim to be a vertical ring like reference
    rimTorus.rotation.x = Math.PI / 2;
    rimTorus.position.y = 0;
    ufo.add(rimTorus);

    // Upper dome - small and dark
    const domeGeometry = new THREE.SphereGeometry(1.0, 40, 20);
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.6;
    ufo.add(dome);

    // Dome ring connector
    const domeRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.12, 16, 48),
        hullMaterial
    );
    domeRing.position.y = 0.50;
    domeRing.rotation.x = Math.PI / 2;
    ufo.add(domeRing);

    // Central hub - dark underside
    const hubGeometry = new THREE.SphereGeometry(1.8, 40, 16);
    const hub = new THREE.Mesh(hubGeometry, darkMaterial);
    hub.scale.set(1, 0.3, 1);
    hub.position.y = -0.2;
    ufo.add(hub);

    // Center dark disc - underside feature
    const centerDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 1.6, 0.1, 48),
        darkMaterial
    );
    centerDisc.position.y = -0.45;
    ufo.add(centerDisc);

    // Panel lines - rings that follow the saucer curvature
    const panelLineMaterial = new THREE.MeshStandardMaterial({
        color: 0x909090,
        roughness: 0.4,
        metalness: 0.7
    });

    // Use the original sphere radius and the saucer Y scale to compute
    // the vertical position on the flattened sphere so rings sit on the surface.
    const sphereRadius = 3.5;
    const saucerScaleY = saucer.scale.y; // 0.15

    // Choose major radii for the decorative rings (in XZ-plane)
    const ringRadii = [2.8, 2.2, 1.6];

    for (let i = 0; i < ringRadii.length; i++) {
        const majorRadius = ringRadii[i];
        const minorRadius = 0.04; // thin groove

        // Compute unscaled Y coordinate on the original sphere for this radius
        const yOnSphere = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - majorRadius * majorRadius));
        // Apply the saucer's Y scale so ring sits flush on the flattened saucer
        const yPos = yOnSphere * saucerScaleY - 0.02; // sink slightly into surface

        const panelLine = new THREE.Mesh(
            new THREE.TorusGeometry(majorRadius, minorRadius, 12, 128),
            panelLineMaterial
        );
        panelLine.position.y = yPos;
        panelLine.rotation.x = Math.PI / 2;
        ufo.add(panelLine);
    }

    // Mirror the same rings on the underside of the saucer
    for (let i = 0; i < ringRadii.length; i++) {
        const majorRadius = ringRadii[i];
        const minorRadius = 0.04;

        const yOnSphere = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - majorRadius * majorRadius));
        // mirrored negative Y position and sink slightly into underside
        const yPosNeg = -yOnSphere * saucerScaleY - 0.02;

        const undersideLine = new THREE.Mesh(
            new THREE.TorusGeometry(majorRadius, minorRadius, 12, 128),
            panelLineMaterial
        );
        undersideLine.position.y = yPosNeg;
        undersideLine.rotation.x = Math.PI / 2;
        ufo.add(undersideLine);
    }

    // Simple fixed landing feet (3) placed under the saucer
    const feetGroup = new THREE.Group();
    const footStrutMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        roughness: 0.45,
        metalness: 0.3
    });
    const footPadMaterial = new THREE.MeshStandardMaterial({
        color: 0x282828,
        roughness: 0.6,
        metalness: 0.1
    });

    const feetCount = 3;
    const feetRadius = 2.1; // radial placement from center
    const strutRadius = 0.12;
    const strutHeight = 0.6;
    const padRadius = 0.28;
    // Compute foot top Y so the strut top sits flush with the saucer underside
    const yOnSphereForFeet = Math.sqrt(Math.max(0, sphereRadius * sphereRadius - feetRadius * feetRadius));
    const footY = -yOnSphereForFeet * saucerScaleY - 0.02; // slight sink into surface

    for (let i = 0; i < feetCount; i++) {
        const angle = (i / feetCount) * Math.PI * 2 + Math.PI / 6;
        const fx = Math.cos(angle) * feetRadius;
        const fz = Math.sin(angle) * feetRadius;

        const foot = new THREE.Group();
        foot.position.set(fx, footY, fz);

        // Strut
        const strut = new THREE.Mesh(
            new THREE.CylinderGeometry(strutRadius, strutRadius, strutHeight, 12),
            footStrutMaterial
        );
        strut.position.y = -strutHeight / 2;
        foot.add(strut);

        // Pad
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(padRadius, padRadius, 0.06, 16),
            footPadMaterial
        );
        pad.position.y = -strutHeight - 0.03;
        foot.add(pad);

        feetGroup.add(foot);
    }

    ufo.add(feetGroup);

    // Underside lights - subtle glow
    const lightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff88,
        emissive: 0xffff00,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.5
    });

    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const light = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 16, 16),
            lightMaterial
        );
        light.position.x = Math.cos(angle) * 2.5;
        light.position.z = Math.sin(angle) * 2.5;
        light.position.y = -0.22;
        ufo.add(light);
    }

    // Add shadows
    ufo.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return ufo;
}
