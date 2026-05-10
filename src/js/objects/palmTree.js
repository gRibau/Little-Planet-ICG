import * as THREE from 'three';

export function createPalmTree() {
    const palm = new THREE.Group();

    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x7b5531,
        roughness: 0.9,
        metalness: 0.02
    });

    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f8a46,
        roughness: 0.8,
        metalness: 0.02
    });

    const trunkRadius = 0.6;
    const trunkScale = [0.46, 0.72, 0.46];
    const trunkCount = 7;
    const overlap = 0.32;
    const segmentHeight = trunkRadius * 2 * trunkScale[1];
    const step = segmentHeight * (1 - overlap);
    const trunkTilt = 0.03;
    const trunkTiltStep = 0.015;

    for (let i = 0; i < trunkCount; i += 1) {
        const trunk = new THREE.Mesh(new THREE.SphereGeometry(trunkRadius, 12, 10), trunkMaterial);
        trunk.scale.set(trunkScale[0], trunkScale[1], trunkScale[2]);
        trunk.position.y = 0.4 + i * step;
        trunk.rotation.z = trunkTilt + i * trunkTiltStep;
        palm.add(trunk);
    }

    const crownY = 0.4 + (trunkCount - 1) * step + trunkRadius * trunkScale[1] * 0.7;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), trunkMaterial);
    crown.position.y = crownY;
    palm.add(crown);

    const leafAngles = [12, 86, 158, 231, 304];
    const stem1Length = 1.25;
    const stem2Length = 0.95;
    const stem1RadiusTop = 0.24;
    const stem1RadiusBottom = 0.36;
    const stem2RadiusTop = 0.16;
    const stem2RadiusBottom = 0.24;
    const leafOverlap = 0.1;

    function addLeaf(angleDeg, options = {}) {
        const {
            yOffset = 0.12,
            stem1Scale = 1.0,
            stem2Scale = 1.0,
            tipScale = 1.0,
            tiltOffset = 0,
            stem1TiltDelta = 0,
            stem2TiltDelta = 0,
            tipTiltDelta = 0
        } = options;

        const leafGroup = new THREE.Group();
        leafGroup.position.y = crownY + yOffset;
        leafGroup.rotation.y = THREE.MathUtils.degToRad(angleDeg);
        const isUpwardLeaf = angleDeg === 0 || angleDeg === 45 || angleDeg === 315;
        const baseTilt = isUpwardLeaf ? 28 : 18;
        const groupTilt = baseTilt + tiltOffset + THREE.MathUtils.randFloatSpread(6);
        leafGroup.rotation.x = THREE.MathUtils.degToRad(groupTilt);

        const stem1 = new THREE.Mesh(
            new THREE.CylinderGeometry(
                stem1RadiusTop * stem1Scale,
                stem1RadiusBottom * stem1Scale,
                stem1Length * stem1Scale,
                12
            ),
            leafMaterial
        );
        const stem1Len = stem1Length * stem1Scale;
        const stem2Len = stem2Length * stem2Scale;
        const tipLen = 0.85 * tipScale;

        stem1.rotation.x = Math.PI / 2 + THREE.MathUtils.degToRad(stem1TiltDelta);
        stem1.position.z = stem1Len / 2;
        leafGroup.add(stem1);

        const stem2Pivot = new THREE.Group();
        const stem2PivotZ = stem1Len - leafOverlap;
        stem2Pivot.position.set(0, 0, stem2PivotZ);
        const stem2Tilt = (isUpwardLeaf ? 38 : 26) + tiltOffset + stem2TiltDelta + THREE.MathUtils.randFloatSpread(6);
        stem2Pivot.rotation.x = THREE.MathUtils.degToRad(stem2Tilt);
        leafGroup.add(stem2Pivot);

        const stem2 = new THREE.Mesh(
            new THREE.CylinderGeometry(
                stem2RadiusTop * stem2Scale,
                stem2RadiusBottom * stem2Scale,
                stem2Length * stem2Scale,
                12
            ),
            leafMaterial
        );
        stem2.rotation.x = Math.PI / 2;
        stem2.position.z = stem2Len / 2;
        stem2Pivot.add(stem2);

        const tipPivot = new THREE.Group();
        const tipPivotZ = stem2Len - leafOverlap;
        tipPivot.position.set(0, 0, tipPivotZ);
        const tipTilt = (isUpwardLeaf ? 50 : 36) + tiltOffset + tipTiltDelta + THREE.MathUtils.randFloatSpread(6);
        tipPivot.rotation.x = THREE.MathUtils.degToRad(tipTilt);
        stem2Pivot.add(tipPivot);

        const tip = new THREE.Mesh(
            new THREE.CylinderGeometry(
                stem2RadiusTop * tipScale,
                stem2RadiusBottom * tipScale * 0.95,
                tipLen,
                12
            ),
            leafMaterial
        );
        tip.rotation.x = Math.PI / 2;
        tip.position.z = tipLen / 2;
        tipPivot.add(tip);

        palm.add(leafGroup);
    }

    const leafTiltOffsets = [-6, -2, 4, -3, 2];
    for (let i = 0; i < leafAngles.length; i += 1) {
        addLeaf(leafAngles[i], {
            tiltOffset: leafTiltOffsets[i]
        });
    }


    palm.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return palm;
}
