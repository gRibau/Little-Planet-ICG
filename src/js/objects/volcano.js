import * as THREE from 'three';

export function createVolcano() {
    const volcano = new THREE.Group();

    const baseRadius = 3.2;
    const topRadius = 0.6;
    const height = 3.6;

    const rockMaterial = new THREE.MeshStandardMaterial({
        color: 0x3b2f2a,
        roughness: 0.85,
        metalness: 0.05,
        side: THREE.DoubleSide
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a3a34,
        roughness: 0.8,
        metalness: 0.05
    });

    const craterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a120f,
        roughness: 0.95,
        metalness: 0.01,
        side: THREE.DoubleSide
    });

    const lavaMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6a22,
        emissive: 0xff3a00,
        emissiveIntensity: 1.6,
        roughness: 0.4,
        metalness: 0.0
    });

    const base = new THREE.Mesh(new THREE.CylinderGeometry(topRadius, baseRadius, height, 16, 1, true), rockMaterial);
    base.position.y = height / 2;
    volcano.add(base);

    const craterHoleRadius = topRadius * 0.95;
    const topPlate = new THREE.Mesh(new THREE.RingGeometry(craterHoleRadius, topRadius * 1.02, 20), rockMaterial);
    topPlate.rotation.x = -Math.PI / 2;
    topPlate.position.y = height;
    volcano.add(topPlate);

    const craterWall = new THREE.Mesh(new THREE.CylinderGeometry(craterHoleRadius * 1.04, craterHoleRadius * 1.04, 1.2, 16, 1, true), craterMaterial);
    craterWall.position.y = height - 0.6;
    volcano.add(craterWall);

    const lavaFill = new THREE.Mesh(new THREE.CylinderGeometry(craterHoleRadius, craterHoleRadius, 0.45, 18), lavaMaterial);
    lavaFill.position.y = height - 1.15;
    volcano.add(lavaFill);

    const glow = new THREE.PointLight(0xff6a22, 3.5, 10);
    glow.position.set(0, height - 1.45, 0);
    volcano.add(glow);

    const rockAngles = [0, 60, 140, 210, 280, 330];
    for (const angleDeg of rockAngles) {
        const angle = THREE.MathUtils.degToRad(angleDeg);
        const rock = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 6), rockMaterial);
        rock.position.set(
            Math.cos(angle) * (baseRadius + 0.45),
            0.35,
            Math.sin(angle) * (baseRadius + 0.45)
        );
        rock.rotation.y = angle + 0.6;
        rock.rotation.z = 0.2;
        volcano.add(rock);
    }

    volcano.traverse((part) => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });

    return volcano;
}
