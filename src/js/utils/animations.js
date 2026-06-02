/**
 * Applies an elastic "pop-up" scale animation to a model.
 * @param {THREE.Object3D} model - The 3D model to scale.
 * @param {THREE.Vector3} baseScale - The target/base scale of the model.
 * @param {number} t - The animation progress from 0.0 to 1.0.
 */
export function applyPopAnimation(model, baseScale, t) {
    // Elastic pop/overshoot (easeOutBack formula)
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const scaleT = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    
    // Safety clamp in case t is slightly out of bounds
    const safeScaleT = Math.max(0, scaleT);

    model.scale.copy(baseScale).multiplyScalar(safeScaleT);
}
