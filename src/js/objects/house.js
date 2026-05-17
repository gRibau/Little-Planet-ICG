import * as THREE from 'three';

export function createHouse() {
    const house = new THREE.Group();

    // ── Dark-washed-blue palette ──────────────────────────────────────────────
    const wallMat    = new THREE.MeshStandardMaterial({ color: 0x4a6278, roughness: 0.88 });
    const trimMat    = new THREE.MeshStandardMaterial({ color: 0xd5e2ec, roughness: 0.60 });
    const roofMat    = new THREE.MeshStandardMaterial({ color: 0x1a2535, roughness: 0.92, side: THREE.DoubleSide });
    const roofTrim   = new THREE.MeshStandardMaterial({ color: 0x121e2c, roughness: 0.92 });
    const glassMat   = new THREE.MeshStandardMaterial({ color: 0x7aaddd, emissive: 0x1a3355, emissiveIntensity: 0.5, roughness: 0.1, transparent: true, opacity: 0.72 });
    const doorMat    = new THREE.MeshStandardMaterial({ color: 0x1c3850, roughness: 0.70 });
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x384f62, roughness: 0.90 });
    const foundMat   = new THREE.MeshStandardMaterial({ color: 0x687888, roughness: 0.95 });
    const brassMat   = new THREE.MeshStandardMaterial({ color: 0xd4a820, roughness: 0.30, metalness: 0.85 });
    const flowerMat  = new THREE.MeshStandardMaterial({ color: 0xf0e050, roughness: 0.80, emissive: 0x806000, emissiveIntensity: 0.2 });
    const plantMat   = new THREE.MeshStandardMaterial({ color: 0x2a6030, roughness: 0.90 });
    const boxMat     = new THREE.MeshStandardMaterial({ color: 0x253a2a, roughness: 0.90 });
    const shutterMat = new THREE.MeshStandardMaterial({ color: 0x142030, roughness: 0.85 });
    const panelMat   = new THREE.MeshStandardMaterial({ color: 0x142840, roughness: 0.75 });
    const garageDMat = new THREE.MeshStandardMaterial({ color: 0x3d5568, roughness: 0.80 });

    // ── Helpers ───────────────────────────────────────────────────────────────
    const box = (w, h, d, mat, x, y, z) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        house.add(m);
        return m;
    };
    const cyl = (rt, rb, h, seg, mat, x, y, z) => {
        const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
        m.position.set(x, y, z);
        house.add(m);
        return m;
    };
    const poly = (verts, idx, mat) => {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts.flat()), 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        house.add(new THREE.Mesh(geo, mat));
    };

    // Gable roof — all coords in house world space, ridge runs along Z
    function gableRoof(cx, cz, rW, rD, baseY, topY) {
        const h = topY - baseY;
        // slopes
        poly([[cx-rW,baseY,cz-rD],[cx-rW,baseY,cz+rD],[cx,topY,cz+rD],[cx,topY,cz-rD]], [0,1,2,0,2,3], roofMat);
        poly([[cx+rW,baseY,cz+rD],[cx+rW,baseY,cz-rD],[cx,topY,cz-rD],[cx,topY,cz+rD]], [0,1,2,0,2,3], roofMat);
        // gables
        poly([[cx-rW,baseY,cz+rD],[cx+rW,baseY,cz+rD],[cx,topY,cz+rD]], [0,1,2], roofMat);
        poly([[cx+rW,baseY,cz-rD],[cx-rW,baseY,cz-rD],[cx,topY,cz-rD]], [0,1,2], roofMat);
        // tile strips
        const ang = Math.atan2(h, rW);
        for (let i = 1; i <= 5; i++) {
            const t = i / 6, ly = baseY + h * t, lx = rW * (1 - t);
            for (const [sx, rot] of [[cx - lx, -ang],[cx + lx, ang]]) {
                const s = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.055, rD * 2), roofTrim);
                s.position.set(sx, ly, cz); s.rotation.z = rot; house.add(s);
            }
        }
        // ridge
        const r = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, rD * 2 + 0.1, 7), roofTrim);
        r.position.set(cx, topY + 0.04, cz); r.rotation.x = Math.PI / 2; house.add(r);
        // fascia
        box(rW*2+0.12, 0.18, 0.12, trimMat,   cx,      baseY+0.09, cz+rD);
        box(rW*2+0.12, 0.18, 0.12, trimMat,   cx,      baseY+0.09, cz-rD);
        box(0.12,      0.18, rD*2+0.12, trimMat, cx-rW, baseY+0.09, cz);
        box(0.12,      0.18, rD*2+0.12, trimMat, cx+rW, baseY+0.09, cz);
    }

    // ── Dimensions ────────────────────────────────────────────────────────────
    const W = 7.0, D = 4.5, wallH = 3.2, wT = 0.22;
    const ovh = 0.45, rW = W/2 + ovh, rD = D/2 + ovh;
    const gY  = 0.28;               // top of foundation
    const rbY = gY + wallH;         // roof base
    const rdY = rbY + 2.0;          // ridge

    const doorW = 1.05, doorH = 2.2;
    const winW  = 0.95, winH  = 1.0;
    const fZ    = D/2 + wT/2;       // front-face Z of front wall outer surface

    // ── Foundation ────────────────────────────────────────────────────────────
    box(W+0.4, 0.28, D+0.4, foundMat, 0, 0.14, 0);

    // ── Walls ─────────────────────────────────────────────────────────────────
    box(W,   wallH, wT,  wallMat, 0,     gY+wallH/2,  D/2);   // front
    box(W,   wallH, wT,  wallMat, 0,     gY+wallH/2, -D/2);   // back
    box(wT,  wallH, D,   wallMat,-W/2,   gY+wallH/2,  0);     // left
    box(wT,  wallH, D,   wallMat, W/2,   gY+wallH/2,  0);     // right

    // Corner boards
    for (const [cx,cz] of [[-W/2,-D/2],[W/2,-D/2],[-W/2,D/2],[W/2,D/2]])
        box(0.12, wallH+0.06, 0.12, trimMat, cx, gY+wallH/2, cz);

    // Top plate band
    box(W+0.14, 0.15, 0.15, trimMat,  0,    rbY+0.075,  D/2);
    box(W+0.14, 0.15, 0.15, trimMat,  0,    rbY+0.075, -D/2);
    box(0.15,   0.15, D+0.14, trimMat,-W/2, rbY+0.075,  0);
    box(0.15,   0.15, D+0.14, trimMat, W/2, rbY+0.075,  0);

    // ── Main roof ─────────────────────────────────────────────────────────────
    gableRoof(0, 0, rW, rD, rbY, rdY);

    // ── Door ──────────────────────────────────────────────────────────────────
    {
        const dp = new THREE.Mesh(new THREE.PlaneGeometry(doorW-0.1, doorH-0.08), doorMat);
        dp.position.set(0, gY+doorH/2, fZ+0.01); house.add(dp);
    }
    const fT = 0.07;
    box(fT, doorH+fT*2, fT, trimMat, -(doorW/2+fT/2), gY+doorH/2,     fZ+0.02);
    box(fT, doorH+fT*2, fT, trimMat,  (doorW/2+fT/2), gY+doorH/2,     fZ+0.02);
    box(doorW+fT*2, fT, fT, trimMat, 0,  gY+doorH+fT/2, fZ+0.02);
    // raised panels
    box(doorW*0.54, doorH*0.33, fT*0.5, panelMat, 0, gY+doorH*0.70, fZ+0.03);
    box(doorW*0.54, doorH*0.33, fT*0.5, panelMat, 0, gY+doorH*0.28, fZ+0.03);
    // transom window above door (single clean glass pane)
    { const tr = new THREE.Mesh(new THREE.PlaneGeometry(doorW-0.1, 0.30), glassMat);
      tr.position.set(0, gY+doorH+0.19, fZ+0.01); house.add(tr);
      // transom frame
      box(doorW+fT*2, fT, fT, trimMat, 0, gY+doorH+fT/2,    fZ+0.02);
      box(doorW+fT*2, fT, fT, trimMat, 0, gY+doorH+0.36,    fZ+0.02); }
    // knob
    { const k = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), brassMat);
      k.position.set(0.35, gY+doorH*0.5, fZ+0.09); house.add(k); }

    // ── Window helper ─────────────────────────────────────────────────────────
    function addWindow(cx, cz, rotY = 0, flowers = true) {
        const g = new THREE.Group();
        g.position.set(cx, gY + 0.95 + winH/2, cz);
        g.rotation.y = rotY;
        house.add(g);

        // glass pane
        const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW-0.1, winH-0.06), glassMat);
        glass.position.z = 0.01; g.add(glass);

        // frame bars (local Z)
        const ft = 0.06;
        for (const [lx,ly,lw,lh] of [
            [-(winW/2), 0, ft, winH], [(winW/2), 0, ft, winH],
            [0,  winH/2, winW+ft, ft], [0, -winH/2, winW+ft, ft],
            [0, 0, ft, winH],
            [0, winH*0.2, winW, ft*0.8],
        ]) {
            const b = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, ft), trimMat);
            b.position.set(lx, ly, 0.025); g.add(b);
        }

        // sill
        const sill = new THREE.Mesh(new THREE.BoxGeometry(winW+0.22, 0.07, 0.2), trimMat);
        sill.position.set(0, -winH/2-0.035, 0.10); g.add(sill);

        // shutters
        for (const sx of [-(winW/2+0.12), winW/2+0.12]) {
            const sh = new THREE.Mesh(new THREE.BoxGeometry(0.18, winH+0.06, 0.04), shutterMat);
            sh.position.set(sx, 0, 0.02); g.add(sh);
            for (let si = -2; si <= 2; si++) {
                const sl = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.025, 0.02), trimMat);
                sl.position.set(sx, si*(winH/5.5), 0.043); g.add(sl);
            }
        }

        if (flowers) {
            const fb = new THREE.Mesh(new THREE.BoxGeometry(winW*0.80, 0.13, 0.15), boxMat);
            fb.position.set(0, -winH/2-0.10, 0.10); g.add(fb);
            for (let fi = -1; fi <= 1; fi++) {
                const fl = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), flowerMat);
                fl.position.set(fi*0.22, -winH/2+0.02, 0.16); g.add(fl);
                const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5), plantMat);
                st.position.set(fi*0.22, -winH/2-0.08, 0.15); g.add(st);
            }
        }
    }

    // front (flanking door)
    addWindow(-2.3, fZ);
    addWindow( 2.3, fZ);
    // back
    addWindow(-1.8, -(D/2+wT/2), Math.PI);
    addWindow( 1.8, -(D/2+wT/2), Math.PI);
    // left side (rotate -PI/2 so local +Z faces outward i.e. global -X)
    addWindow(-(W/2+wT/2),  0.6, -Math.PI/2);
    addWindow(-(W/2+wT/2), -0.6, -Math.PI/2);

    // ── Front porch ───────────────────────────────────────────────────────────
    // porchD: how far the porch extends past the front wall
    const porchW = 3.4, porchD = 1.2, colH = doorH + 0.5;
    // slab flush against front wall
    box(porchW, 0.13, porchD, foundMat, 0, gY+0.065, fZ + porchD/2);
    // steps in front of slab
    for (let s = 0; s < 3; s++)
        box(porchW - s*0.28, 0.09, 0.28, foundMat, 0, gY-(s+1)*0.09+0.045, fZ+porchD+(s+0.5)*0.28);
    // columns at front edge of slab
    const colZ = fZ + porchD - 0.12;
    for (const cx of [-porchW/2+0.14, -porchW/6, porchW/6, porchW/2-0.14]) {
        cyl(0.10, 0.115, colH, 12, trimMat, cx, gY+colH/2, colZ);
        box(0.24, 0.08, 0.24, trimMat, cx, gY+0.04,      colZ);
        box(0.24, 0.08, 0.24, trimMat, cx, gY+colH-0.04,  colZ);
    }
    // entablature: beam across column tops
    box(porchW+0.18, 0.20, 0.20, trimMat, 0, gY+colH+0.10, colZ);
    // back beam against house wall
    box(porchW+0.18, 0.20, 0.20, trimMat, 0, gY+colH+0.10, fZ);
    // porch roof plate (flat, spans column-top to house wall)
    box(porchW+0.18, 0.12, porchD, roofTrim, 0, gY+colH+0.26, fZ + porchD/2);
    // pediment — proper 3D triangular prism, DoubleSide so visible from all angles
    {
        const pW  = porchW/2 + 0.12;
        const pBY = gY + colH + 0.20;
        const pTY = pBY + 0.65;
        const pF  = colZ;
        const pB  = fZ;
        const pedMat = new THREE.MeshStandardMaterial({ color: 0xd5e2ec, roughness: 0.60, side: THREE.DoubleSide });
        // front & back faces
        poly([[-pW,pBY,pF],[pW,pBY,pF],[0,pTY,pF]], [0,1,2], pedMat);
        poly([[-pW,pBY,pB],[0,pTY,pB],[pW,pBY,pB]], [0,1,2], pedMat);
        // left raking slope
        poly([[-pW,pBY,pF],[-pW,pBY,pB],[0,pTY,pB],[0,pTY,pF]], [0,1,2,0,2,3], pedMat);
        // right raking slope
        poly([[pW,pBY,pF],[0,pTY,pF],[0,pTY,pB],[pW,pBY,pB]], [0,1,2,0,2,3], pedMat);
        // bottom
        poly([[-pW,pBY,pF],[pW,pBY,pF],[pW,pBY,pB],[-pW,pBY,pB]], [0,1,2,0,2,3], pedMat);
    }

    // ── Garage wing ───────────────────────────────────────────────────────────
    const gW = 3.6, gD = 4.0, gWH = 2.6;
    const gX = W/2 + gW/2;          // garage center X
    const gRbY = gY + gWH;
    const gRdY = gRbY + 1.4;
    const gRW  = gW/2 + 0.4, gRD = gD/2 + 0.4;

    box(gW+0.3, 0.28, gD+0.3, foundMat, gX, 0.14, 0);
    box(gW,  gWH, wT,  wallMat, gX, gY+gWH/2,  gD/2);   // front
    box(gW,  gWH, wT,  wallMat, gX, gY+gWH/2, -gD/2);   // back
    box(wT,  gWH, gD,  wallMat, gX+gW/2, gY+gWH/2, 0);  // far right
    // (left side shared with main house right wall — no extra wall needed)

    // garage corner boards
    for (const [cx,cz] of [[gX-gW/2,-gD/2],[gX+gW/2,-gD/2],[gX-gW/2,gD/2],[gX+gW/2,gD/2]])
        box(0.12, gWH+0.06, 0.12, trimMat, cx, gY+gWH/2, cz);

    // top plate
    box(gW+0.14, 0.15, 0.15, trimMat, gX, gRbY+0.075,  gD/2);
    box(gW+0.14, 0.15, 0.15, trimMat, gX, gRbY+0.075, -gD/2);
    box(0.15, 0.15, gD+0.14, trimMat, gX+gW/2, gRbY+0.075, 0);

    gableRoof(gX, 0, gRW, gRD, gRbY, gRdY);

    // garage door (front face)
    const gdW = gW - 0.4, gdH = gWH * 0.75, gdZ = gD/2 + wT/2;
    const panH = gdH / 4;
    for (let pi = 0; pi < 4; pi++) {
        const py = gY + panH*pi + panH/2;
        box(gdW, panH-0.04, 0.06, garageDMat, gX, py, gdZ);
        box(gdW, 0.03, 0.04, roofTrim, gX, gY+panH*(pi+1), gdZ);
    }
    // garage door frame
    box(fT, gdH+fT*2, fT, trimMat, gX-(gdW/2+fT/2), gY+gdH/2, gdZ+0.01);
    box(fT, gdH+fT*2, fT, trimMat, gX+(gdW/2+fT/2), gY+gdH/2, gdZ+0.01);
    box(gdW+fT*2, fT, fT, trimMat, gX, gY+gdH+fT/2, gdZ+0.01);

    // ── Chimney ───────────────────────────────────────────────────────────────
    const chimH = 1.9;
    const chX = W/4, chZ = -D/4;
    box(0.52, chimH, 0.52, chimneyMat, chX, rbY + chimH/2, chZ);
    box(0.70, 0.10,  0.70, roofTrim,   chX, rbY + chimH + 0.05, chZ);
    box(0.44, 0.28,  0.44, chimneyMat, chX, rbY + chimH - 0.10, chZ);

    // ── Shadows ───────────────────────────────────────────────────────────────
    house.traverse(p => { if (p.isMesh) { p.castShadow = true; p.receiveShadow = true; } });

    return house;
}
