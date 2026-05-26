import * as THREE from 'three';

export function createHut() {
    const hut = new THREE.Group();
    const windows = [];

    // ── Materials ──────────────────────────────────────────────────────────────
    const logMat = new THREE.MeshStandardMaterial({
        color: 0x3b2010, roughness: 1.0, metalness: 0.0
    });
    const plankMat = new THREE.MeshStandardMaterial({
        color: 0x5c3418, roughness: 0.95, metalness: 0.0
    });
    const darkLogMat = new THREE.MeshStandardMaterial({
        color: 0x2a1608, roughness: 1.0, metalness: 0.0
    });
    const thatchMat = new THREE.MeshStandardMaterial({
        color: 0x6b5010, roughness: 1.0, metalness: 0.0,
        side: THREE.DoubleSide   // visible from inside the hut
    });
    const thatchDarkMat = new THREE.MeshStandardMaterial({
        color: 0x3f2e08, roughness: 1.0, metalness: 0.0,
        side: THREE.DoubleSide
    });
    const boneMat = new THREE.MeshStandardMaterial({
        color: 0xd4c898, roughness: 0.8, metalness: 0.0
    });
    const ropeMat = new THREE.MeshStandardMaterial({
        color: 0x8b7040, roughness: 1.0, metalness: 0.0
    });
    const fireMat = new THREE.MeshStandardMaterial({
        color: 0xff8800, emissive: 0xff5500, emissiveIntensity: 2.5,
        roughness: 0.5, metalness: 0.0, transparent: true, opacity: 0.9
    });
    const emberMat = new THREE.MeshStandardMaterial({
        color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 3.0,
        roughness: 0.5, metalness: 0.0
    });
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x5a5040, roughness: 0.95, metalness: 0.0
    });

    // ── Helper: add a log (cylinder) ──────────────────────────────────────────
    function addLog(parent, rx, ry, rz, px, py, pz, rotX = 0, rotZ = 0) {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rx, ry, rz, 8), logMat);
        m.position.set(px, py, pz);
        m.rotation.x = rotX;
        m.rotation.z = rotZ;
        parent.add(m);
        return m;
    }

    // ── Stilts ─────────────────────────────────────────────────────────────────
    const stiltH = 1.4;
    const stiltR = 0.12;
    const stilts = [
        [-1.3, -1.1], [1.3, -1.1], [-1.3, 1.1], [1.3, 1.1],
        [-1.3, 0.0], [1.3, 0.0]   // extra mid-span support
    ];
    for (const [sx, sz] of stilts) {
        addLog(hut, stiltR, stiltR * 1.1, stiltH, sx, stiltH / 2, sz);
    }

    // Cross-bracing between front pair and back pair
    const braceY = stiltH * 0.5;
    for (const sz of [-1.1, 1.1]) {
        const brace = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.06, 2.7, 6), darkLogMat
        );
        brace.position.set(0, braceY, sz);
        brace.rotation.z = Math.PI / 2;
        hut.add(brace);
    }

    // ── Floor platform ────────────────────────────────────────────────────────
    const floorY = stiltH;
    const W = 3.0, D = 2.6, floorThick = 0.14;

    // Platform planks (several thin boxes side by side)
    const plankCount = 10;
    const plankW = W / plankCount;
    for (let i = 0; i < plankCount; i++) {
        const px = -W / 2 + plankW * (i + 0.5);
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(plankW - 0.03, floorThick, D + 0.3), plankMat
        );
        plank.position.set(px, floorY - floorThick / 2, 0);
        hut.add(plank);
    }

    // ── Walls ─────────────────────────────────────────────────────────────────
    const wallH = 2.0;
    const wallBaseY = floorY;
    const wallT = 0.2;

    // Back wall — full
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(W, wallH, wallT), plankMat
    );
    backWall.position.set(0, wallBaseY + wallH / 2, -D / 2);
    hut.add(backWall);

    // Side walls — full
    for (const sx of [-W / 2, W / 2]) {
        const side = new THREE.Mesh(
            new THREE.BoxGeometry(wallT, wallH, D), plankMat
        );
        side.position.set(sx, wallBaseY + wallH / 2, 0);
        hut.add(side);
    }

    // Front wall — split with door gap
    const doorW = 0.75, doorH = 1.5;
    const sideW = (W - doorW) / 2;
    for (const side of [-1, 1]) {
        const fwall = new THREE.Mesh(
            new THREE.BoxGeometry(sideW - 0.02, wallH, wallT), plankMat
        );
        fwall.position.set(side * (doorW / 2 + sideW / 2), wallBaseY + wallH / 2, D / 2);
        hut.add(fwall);
    }
    // Header above door
    const header = new THREE.Mesh(
        new THREE.BoxGeometry(doorW + 0.08, wallH - doorH, wallT), plankMat
    );
    header.position.set(0, wallBaseY + doorH + (wallH - doorH) / 2, D / 2);
    hut.add(header);

    // Horizontal log accents on walls (rough planks / battens)
    const battenOffsets = [0.45, 0.95, 1.5];
    for (const yOff of battenOffsets) {
        for (const sz of [-D / 2 + 0.01, D / 2 - 0.01]) {
            const batten = new THREE.Mesh(
                new THREE.BoxGeometry(W + 0.04, 0.08, 0.09), darkLogMat
            );
            batten.position.set(0, wallBaseY + yOff, sz);
            hut.add(batten);
        }
        for (const sx of [-W / 2 + 0.01, W / 2 - 0.01]) {
            const batten = new THREE.Mesh(
                new THREE.BoxGeometry(0.09, 0.08, D + 0.04), darkLogMat
            );
            batten.position.set(sx, wallBaseY + yOff, 0);
            hut.add(batten);
        }
    }

    // Corner log posts (give a log-cabin feel)
    const postH = wallH + 0.2;
    for (const [sx, sz] of [[-W/2, -D/2], [W/2, -D/2], [-W/2, D/2], [W/2, D/2]]) {
        addLog(hut, 0.14, 0.14, postH, sx, wallBaseY + postH / 2, sz);
    }

    // ── Roof (GABLE — ridge runs along Z) ────────────────────────────────────
    const roofBaseY = wallBaseY + wallH;
    const roofH = 2.4;
    const overhang = 0.35;
    const rW = W / 2 + overhang;   // half-span in X (with overhang)
    const rD = D / 2 + overhang;   // half-depth in Z (with overhang)
    const ridgeY = roofBaseY + roofH;

    // Helper: quad face (two triangles)
    function makeRoofQuad(a, b, c, d, mat) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(
            new Float32Array([...a, ...b, ...c, ...d]), 3
        ));
        geo.setIndex([0, 1, 2, 0, 2, 3]);
        geo.computeVertexNormals();
        hut.add(new THREE.Mesh(geo, mat));
    }
    // Helper: triangle face
    function makeRoofTri(a, b, c, mat) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(
            new Float32Array([...a, ...b, ...c]), 3
        ));
        geo.setIndex([0, 1, 2]);
        geo.computeVertexNormals();
        hut.add(new THREE.Mesh(geo, mat));
    }

    // Left slope  (x = -rW at base → x = 0 at ridge)
    makeRoofQuad(
        [-rW, roofBaseY, -rD], [-rW, roofBaseY,  rD],
        [  0,    ridgeY,  rD], [  0,    ridgeY, -rD],
        thatchMat
    );
    // Right slope (x = +rW at base → x = 0 at ridge)
    makeRoofQuad(
        [ rW, roofBaseY,  rD], [ rW, roofBaseY, -rD],
        [  0,    ridgeY, -rD], [  0,    ridgeY,  rD],
        thatchMat
    );
    // Front gable triangle (z = +rD)
    makeRoofTri(
        [-rW, roofBaseY, rD], [rW, roofBaseY, rD], [0, ridgeY, rD],
        thatchMat
    );
    // Back gable triangle (z = -rD)
    makeRoofTri(
        [ rW, roofBaseY, -rD], [-rW, roofBaseY, -rD], [0, ridgeY, -rD],
        thatchMat
    );

    // Layered thatch strips — horizontal bands running along Z on each slope
    const layers = 5;
    const slopeAngle = Math.atan2(roofH, rW); // angle of slope from horizontal
    for (let i = 1; i <= layers; i++) {
        const t = i / (layers + 1);
        const ly  = roofBaseY + roofH * t;
        const lx  = rW * (1 - t);              // X position on slope at height t
        const stripLen = rD * 2 + 0.1;
        const stripW   = 0.15;
        const stripThk = 0.07;

        for (const sideSign of [-1, 1]) {
            const strip = new THREE.Mesh(
                new THREE.BoxGeometry(stripW, stripThk, stripLen), thatchDarkMat
            );
            strip.position.set(sideSign * lx, ly, 0);
            // Tilt the strip so it lies flush on the slope surface
            strip.rotation.z = -sideSign * slopeAngle;
            hut.add(strip);
        }
    }

    // Ridge pole (runs the full depth along Z)
    const ridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.065, rD * 2, 6), darkLogMat
    );
    ridge.position.set(0, ridgeY + 0.03, 0);
    ridge.rotation.x = Math.PI / 2; // lay it along Z
    hut.add(ridge);

    // ── Crossed sticks at the gable peaks ─────────────────────────────────────
    // Each gable peak is the top of the triangular gable face:
    //   front peak: (0, ridgeY, rD)   back peak: (0, ridgeY, -rD)
    // Sticks cross in the X-Y plane and protrude upward above the peak.
    const crossAngle = 0.58; // radians tilt from vertical
    const stickLen   = 1.0;
    for (const sz of [rD, -rD]) {
        for (const sign of [-1, 1]) {
            const stick = new THREE.Mesh(
                new THREE.CylinderGeometry(0.038, 0.038, stickLen, 6), darkLogMat
            );
            // Centre the stick at the gable peak so it protrudes equally above & below
            stick.position.set(0, ridgeY, sz);
            stick.rotation.z = sign * crossAngle; // tilt left / right in X-Y plane
            hut.add(stick);
        }
    }

    // Rope lashings at roof base corners
    for (const [sx, sz] of [[-rW, -rD], [rW, -rD], [-rW, rD], [rW, rD]]) {
        const rope = new THREE.Mesh(
            new THREE.TorusGeometry(0.1, 0.035, 6, 12), ropeMat
        );
        rope.position.set(sx * 0.85, roofBaseY + 0.1, sz * 0.85);
        rope.rotation.x = Math.PI / 2;
        hut.add(rope);
    }

    // ── Ladder ────────────────────────────────────────────────────────────────
    const ladderZ = D / 2 + 0.1;
    const ladderH = stiltH + 0.1;
    const railR = 0.05;

    for (const lx of [-0.22, 0.22]) {
        addLog(hut, railR, railR, ladderH + 0.4, lx, ladderH / 2 - 0.2, ladderZ, -0.18, 0);
    }
    const rungs = 4;
    for (let i = 0; i < rungs; i++) {
        const ry = 0.25 + (i / (rungs - 1)) * (ladderH - 0.5);
        const rz = ladderZ + (i / (rungs - 1)) * 0.05;
        addLog(hut, 0.04, 0.04, 0.5, 0, ry, rz, 0, Math.PI / 2);
    }

    // ── Skull-on-a-stake decorations ──────────────────────────────────────────
    function addSkullStake(px, pz, yawRad) {
        const stakeHeight = 1.8;
        // Stake
        const stake = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.07, stakeHeight, 6), darkLogMat
        );
        stake.position.set(px, stakeHeight / 2, pz);
        hut.add(stake);

        // Skull (crude: squashed sphere + two eye sockets)
        const skullGroup = new THREE.Group();
        skullGroup.position.set(px, stakeHeight + 0.2, pz);
        skullGroup.rotation.y = yawRad;

        const skullBody = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 6), boneMat
        );
        skullBody.scale.y = 0.82;
        skullGroup.add(skullBody);

        // Jaw
        const jaw = new THREE.Mesh(
            new THREE.BoxGeometry(0.28, 0.1, 0.18), boneMat
        );
        jaw.position.set(0, -0.18, 0.05);
        skullGroup.add(jaw);

        // Eyes (dark spheres sunk in)
        for (const ex of [-0.08, 0.08]) {
            const eye = new THREE.Mesh(
                new THREE.SphereGeometry(0.055, 6, 5), darkLogMat
            );
            eye.position.set(ex, 0.03, 0.16);
            skullGroup.add(eye);
        }

        hut.add(skullGroup);
    }

    addSkullStake(-W / 2 - 0.55, D / 2 + 0.3, 0.4);
    addSkullStake( W / 2 + 0.55, D / 2 + 0.3, -0.4);
    addSkullStake(-W / 2 - 0.55, -D / 2 - 0.3, 0.9);

    // ── Hanging bones on the front wall corners ───────────────────────────────
    function addHangingBone(px, py, pz) {
        const boneGroup = new THREE.Group();
        boneGroup.position.set(px, py, pz);
        const boneCount = 3;
        for (let i = 0; i < boneCount; i++) {
            const bone = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.3 + i * 0.08, 5), boneMat
            );
            bone.position.set((i - 1) * 0.12, -i * 0.25, 0);
            bone.rotation.z = (i - 1) * 0.3;
            boneGroup.add(bone);
        }
        hut.add(boneGroup);
    }

    // Hang bones right at the outer face of the front wall (D/2 + wallT/2)
    addHangingBone(-doorW / 2 - 0.1, wallBaseY + doorH + 0.1, D / 2 + wallT / 2 + 0.04);
    addHangingBone( doorW / 2 + 0.1, wallBaseY + doorH + 0.1, D / 2 + wallT / 2 + 0.04);

    // ── Torch outside the entrance ────────────────────────────────────────────
    function addTorch(px, pz) {
        const torchGroup = new THREE.Group();
        torchGroup.position.set(px, 0, pz);

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.055, 1.6, 6), darkLogMat
        );
        pole.position.y = 0.8;
        torchGroup.add(pole);

        // Bowl
        const bowl = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.06, 0.18, 8), stoneMat
        );
        bowl.position.y = 1.65;
        torchGroup.add(bowl);

        // Flame
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.09, 0.28, 8), fireMat
        );
        flame.position.y = 1.88;
        torchGroup.add(flame);
        windows.push(flame);

        // Ember point light
        const light = new THREE.PointLight(0xff6600, 2.5, 5.0);
        light.position.y = 1.9;
        torchGroup.add(light);
        windows.push(light);

        hut.add(torchGroup);
    }

    addTorch(-0.8, D / 2 + 0.55);
    addTorch( 0.8, D / 2 + 0.55);

    // ── Stone fire pit in front ────────────────────────────────────────────────
    const pitGroup = new THREE.Group();
    pitGroup.position.set(0, 0.05, D / 2 + 1.2);
    const pitStones = 8;
    for (let i = 0; i < pitStones; i++) {
        const angle = (i / pitStones) * Math.PI * 2;
        const stone = new THREE.Mesh(
            new THREE.SphereGeometry(0.14, 6, 5), stoneMat
        );
        stone.position.set(Math.cos(angle) * 0.38, 0, Math.sin(angle) * 0.38);
        stone.scale.y = 0.5;
        pitGroup.add(stone);
    }
    // Embers
    const embers = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), emberMat);
    embers.scale.y = 0.3;
    embers.position.y = 0.05;
    embers.userData.intensityMultiplier = 1.2; // 3.0 / 2.5
    pitGroup.add(embers);
    windows.push(embers);
    // Fire cone
    const pitFlame = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 8), fireMat);
    pitFlame.position.y = 0.32;
    pitGroup.add(pitFlame);
    windows.push(pitFlame);
    // Fire light
    const pitLight = new THREE.PointLight(0xff6600, 3.0, 7.0);
    pitLight.position.y = 0.5;
    pitLight.userData.intensityMultiplier = 1.2; // 3.0 / 2.5
    pitGroup.add(pitLight);
    windows.push(pitLight);
    hut.add(pitGroup);

    // ── Shadows ───────────────────────────────────────────────────────────────
    hut.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    hut.userData.windows = windows;
    hut.userData.windowLighting = {
        lightColor: 0x000000,
        lightEmissive: 0x000000,
        lightIntensity: 0.0,
        lightOpacity: 0.0,
        darkColor: 0xff8800,
        darkEmissive: 0xff5500,
        darkIntensity: 2.5,
        darkOpacity: 0.9,
        shadowThreshold: 0,
        darkReach: 1 / 3,
        transitionSpeed: 1.0
    };

    return hut;
}
