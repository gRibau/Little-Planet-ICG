import * as THREE from 'three';

export function createHouse() {
    const house = new THREE.Group();

    // ── Materials ──────────────────────────────────────────────────────────────
    const wallMat   = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.85, metalness: 0.0 });
    const roofMat   = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9,  metalness: 0.0, side: THREE.DoubleSide });
    const trimMat   = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.6,  metalness: 0.0 });
    const roofTrim  = new THREE.MeshStandardMaterial({ color: 0x3a2214, roughness: 0.9,  metalness: 0.0 });
    const glassMat  = new THREE.MeshStandardMaterial({ color: 0x88aadd, emissive: 0x223355, emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.72 });
    const doorMat   = new THREE.MeshStandardMaterial({ color: 0x7b2d1c, roughness: 0.7,  metalness: 0.0 });
    const chimneyMat= new THREE.MeshStandardMaterial({ color: 0x8b4c2f, roughness: 0.9,  metalness: 0.0 });
    const foundMat  = new THREE.MeshStandardMaterial({ color: 0xaaa090, roughness: 0.95, metalness: 0.0 });
    const brassKnob = new THREE.MeshStandardMaterial({ color: 0xd4a820, roughness: 0.3,  metalness: 0.85 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xe84040, roughness: 0.8,  metalness: 0.0, emissive: 0x881010, emissiveIntensity: 0.2 });
    const plantMat  = new THREE.MeshStandardMaterial({ color: 0x2d6b2d, roughness: 0.9,  metalness: 0.0 });
    const boxMat    = new THREE.MeshStandardMaterial({ color: 0xc46a1f, roughness: 0.9,  metalness: 0.0 });

    // ── Key dimensions ─────────────────────────────────────────────────────────
    const W = 5.0, D = 3.5, wallH = 2.6, wallT = 0.2;
    const roofH = 1.6, overhang = 0.4;
    const rW = W / 2 + overhang, rD = D / 2 + overhang;
    const groundY = 0.2;           // top of foundation
    const wallBaseY = groundY;
    const roofBaseY = groundY + wallH;
    const ridgeY    = roofBaseY + roofH;

    const doorW = 0.9, doorH = 1.9;
    const winW = 0.85, winH = 0.9, winSillY = groundY + 0.75;

    // ── Foundation ─────────────────────────────────────────────────────────────
    const found = new THREE.Mesh(new THREE.BoxGeometry(W + 0.3, 0.22, D + 0.3), foundMat);
    found.position.set(0, 0.11, 0);
    house.add(found);

    // ── Solid walls ────────────────────────────────────────────────────────────
    const addBox = (geo, mat, px, py, pz) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(px, py, pz);
        house.add(m);
        return m;
    };

    // Back, left, right — full solid
    addBox(new THREE.BoxGeometry(W, wallH, wallT), wallMat, 0,      wallBaseY + wallH / 2, -D / 2);
    addBox(new THREE.BoxGeometry(wallT, wallH, D), wallMat, -W / 2, wallBaseY + wallH / 2, 0);
    addBox(new THREE.BoxGeometry(wallT, wallH, D), wallMat,  W / 2, wallBaseY + wallH / 2, 0);

    // Front — solid (door/windows sit on top as planes + frames)
    addBox(new THREE.BoxGeometry(W, wallH, wallT), wallMat, 0, wallBaseY + wallH / 2, D / 2);

    // ── Corner trim boards ─────────────────────────────────────────────────────
    for (const [cx, cz] of [[-W/2, -D/2], [W/2, -D/2], [-W/2, D/2], [W/2, D/2]]) {
        addBox(new THREE.BoxGeometry(0.1, wallH + 0.05, 0.1), trimMat, cx, wallBaseY + wallH / 2, cz);
    }
    // Top fascia band
    for (const [gx, gz, gw, gd] of [
        [0,      D/2,  W + 0.12, 0.12], [0,    -D/2,  W + 0.12, 0.12],
        [-W/2,   0,    0.12, D + 0.12], [W/2,  0,     0.12, D + 0.12],
    ]) {
        addBox(new THREE.BoxGeometry(gw, 0.14, gd), trimMat, gx, roofBaseY + 0.07, gz);
    }

    // ── Door ───────────────────────────────────────────────────────────────────
    const fZ = D / 2 + wallT / 2;
    const doorPanel = new THREE.Mesh(new THREE.PlaneGeometry(doorW - 0.08, doorH - 0.06), doorMat);
    doorPanel.position.set(0, wallBaseY + doorH / 2, fZ + 0.01);
    house.add(doorPanel);

    // Frame bars
    const fT = 0.065;
    for (const [dx, dy, fw, fh] of [
        [-(doorW/2 + fT/2), wallBaseY + doorH/2,          fT,            doorH + fT*2],
        [ (doorW/2 + fT/2), wallBaseY + doorH/2,          fT,            doorH + fT*2],
        [0,                  wallBaseY + doorH + fT/2,     doorW + fT*2,  fT          ],
    ]) {
        addBox(new THREE.BoxGeometry(fw, fh, fT), trimMat, dx, dy, fZ + 0.02);
    }
    // Door knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), brassKnob);
    knob.position.set(0.3, wallBaseY + doorH * 0.5, fZ + 0.09);
    house.add(knob);
    // Door panel detail (inset rectangle suggestion)
    addBox(new THREE.BoxGeometry(doorW * 0.55, doorH * 0.36, fT * 0.5), new THREE.MeshStandardMaterial({ color: 0x62201a, roughness: 0.7 }), 0, wallBaseY + doorH * 0.68, fZ + 0.03);
    addBox(new THREE.BoxGeometry(doorW * 0.55, doorH * 0.36, fT * 0.5), new THREE.MeshStandardMaterial({ color: 0x62201a, roughness: 0.7 }), 0, wallBaseY + doorH * 0.28, fZ + 0.03);

    // ── Window helper ──────────────────────────────────────────────────────────
    function addWindow(cx, cz, rotY = 0) {
        const g = new THREE.Group();
        g.rotation.y = rotY;
        g.position.set(cx, winSillY + winH / 2, cz);

        // Glass
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW - 0.1, winH - 0.06), glassMat);
        glass.position.z = 0.01;
        g.add(glass);

        // Frame bars (local space)
        const ft = 0.055;
        for (const [lx, ly, lw, lh] of [
            [-(winW/2), 0,       ft,  winH     ],  // left
            [ (winW/2), 0,       ft,  winH     ],  // right
            [0,  winH/2,         winW, ft      ],  // top
            [0, -winH/2,         winW, ft      ],  // bottom/sill bar
            [0,  0,              ft,  winH     ],  // center vertical
            [0,  winH * 0.2,     winW, ft*0.8  ],  // horizontal divider
        ]) {
            const bar = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, ft), trimMat);
            bar.position.set(lx, ly, 0.025);
            g.add(bar);
        }

        // Window sill protrusion
        const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.18, 0.06, 0.16), trimMat);
        sill.position.set(0, -winH / 2 - 0.03, 0.08);
        g.add(sill);

        // Flower box
        const fb = new THREE.Mesh(new THREE.BoxGeometry(winW * 0.75, 0.12, 0.14), boxMat);
        fb.position.set(0, -winH / 2 - 0.1, 0.1);
        g.add(fb);
        for (let fi = -1; fi <= 1; fi++) {
            const fl = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), flowerMat);
            fl.position.set(fi * 0.2, -winH / 2 + 0.02, 0.15);
            g.add(fl);
            const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5), plantMat);
            st.position.set(fi * 0.2, -winH / 2 - 0.07, 0.14);
            g.add(st);
        }

        house.add(g);
    }

    // Front windows (flanking the door)
    addWindow(-1.8, D / 2 + wallT / 2);
    addWindow( 1.8, D / 2 + wallT / 2);
    // Side windows
    addWindow(-W / 2 - wallT / 2,  0.3, Math.PI / 2);
    addWindow( W / 2 + wallT / 2, -0.3, -Math.PI / 2);
    // Back window
    addWindow(0.8, -D / 2 - wallT / 2, Math.PI);

    // ── Front porch ────────────────────────────────────────────────────────────
    const porchW = doorW + 1.1, porchD = 0.9;
    addBox(new THREE.BoxGeometry(porchW, 0.1, porchD), foundMat, 0, groundY + 0.05, D / 2 + porchD / 2);
    // Steps
    for (let s = 0; s < 2; s++) {
        addBox(
            new THREE.BoxGeometry(porchW - s * 0.3, 0.1, 0.28), foundMat,
            0, groundY - (s + 1) * 0.1 + 0.05, D / 2 + porchD + (s + 0.5) * 0.28
        );
    }
    // Columns
    const colH = doorH;
    for (const cx of [-porchW / 2 + 0.12, porchW / 2 - 0.12]) {
        addBox(new THREE.CylinderGeometry(0.09, 0.1, colH, 10), trimMat, cx, groundY + colH / 2, D / 2 + porchD - 0.08);
    }
    // Awning / porch roof
    addBox(new THREE.BoxGeometry(porchW + 0.1, 0.1, porchD + 0.1), roofTrim, 0, groundY + colH + 0.05, D / 2 + porchD / 2);

    // ── Gable roof ─────────────────────────────────────────────────────────────
    const mkQuad = (a, b, c, d) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...c, ...d]), 3));
        geo.setIndex([0, 1, 2, 0, 2, 3]);
        geo.computeVertexNormals();
        house.add(new THREE.Mesh(geo, roofMat));
    };
    const mkTri = (a, b, c) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...c]), 3));
        geo.setIndex([0, 1, 2]);
        geo.computeVertexNormals();
        house.add(new THREE.Mesh(geo, roofMat));
    };

    // Left slope
    mkQuad([-rW, roofBaseY, -rD], [-rW, roofBaseY, rD], [0, ridgeY, rD], [0, ridgeY, -rD]);
    // Right slope
    mkQuad([rW, roofBaseY, rD], [rW, roofBaseY, -rD], [0, ridgeY, -rD], [0, ridgeY, rD]);
    // Gable triangles
    mkTri([-rW, roofBaseY, rD],  [rW, roofBaseY, rD],  [0, ridgeY, rD]);
    mkTri([ rW, roofBaseY, -rD], [-rW, roofBaseY, -rD], [0, ridgeY, -rD]);

    // Tile strips along each slope
    const slopeAngle = Math.atan2(roofH, rW);
    for (let i = 1; i <= 5; i++) {
        const t = i / 6;
        const ly = roofBaseY + roofH * t;
        const lx = rW * (1 - t);
        for (const [sx, rot] of [[-lx, -slopeAngle], [lx, slopeAngle]]) {
            addBox(new THREE.BoxGeometry(0.1, 0.06, rD * 2), roofTrim, sx, ly, 0).rotation.z = rot;
        }
    }

    // Ridge cap
    const ridgePole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, rD * 2 + 0.1, 7), roofTrim);
    ridgePole.position.set(0, ridgeY + 0.04, 0);
    ridgePole.rotation.x = Math.PI / 2;
    house.add(ridgePole);

    // Fascia boards
    for (const [fz, fw, fd] of [
        [rD,  W + 0.1, 0.1], [-rD, W + 0.1, 0.1],
        [-rW, 0.1, D + 0.1], [rW,  0.1, D + 0.1],
    ]) {
        addBox(new THREE.BoxGeometry(fw, 0.18, fd), trimMat, 0, roofBaseY + 0.09, fz);
    }

    // ── Chimney ────────────────────────────────────────────────────────────────
    const chimH = roofH * 0.55 + wallH * 0.25;
    addBox(new THREE.BoxGeometry(0.44, chimH, 0.44), chimneyMat,  W / 4, roofBaseY + chimH / 2, -D / 4);
    addBox(new THREE.BoxGeometry(0.58, 0.1,  0.58), roofTrim,    W / 4, roofBaseY + chimH + 0.05, -D / 4);

    // ── Shadows ────────────────────────────────────────────────────────────────
    house.traverse(part => {
        if (part.isMesh) { part.castShadow = true; part.receiveShadow = true; }
    });

    return house;
}
