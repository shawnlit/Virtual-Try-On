import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getDistance, computeFaceBasis, lerp } from '../utils/math';

console.log("CapModel: THREE classes check:", { 
  Box3: THREE.Box3, 
  Vector3: THREE.Vector3, 
  Matrix4: THREE.Matrix4 
});

/**
 * GLOBAL CONFIG FOR CAPS (Pose-based)
 */
const GLOBAL_CONFIG = {
  SCALE_MULTIPLIER: 4.4,      
  HEAD_OFFSET_UP: 0.35,       // Offset along face UP vector
  OFFSET_FORWARD: -0.1,       // Offset along face FORWARD vector (negative is further back)
  DEPTH_MULTIPLIER: 1.2,      
  LERP_POSITION: 0.3,
  LERP_ROTATION: 0.2,
  LERP_SCALE: 0.1,
  LERP_CALIBRATION: 0.05,
};

/**
 * PER-MODEL NORMALIZATION CONFIG
 */
const MODEL_CONFIGS = {
  '/models/cap1.glb': {
    scaleMultiplier: 1.25,
    offset: [0, 0.2, -0.1],   
    rotation: [0, 0, 0]
  },
  '/models/cap2.glb': {
    scaleMultiplier: 1.0,
    offset: [0, 0, 0],
    rotation: [0, 0, 0]
  }
};

const CapModel = ({ modelPath, landmarks, calibration, isMirrored }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();

  // Smoothing refs
  const smoothedFaceWidth = useRef(0.25);
  const smoothedCalibFactor = useRef(1.0);
  
  // 1. AUTO NORMALIZATION (Bounding Box Centering)
  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene]);

  const mConfig = MODEL_CONFIGS[modelPath] || { scaleMultiplier: 1.0, offset: [0,0,0], rotation: [0,0,0] };

  useFrame(() => {
    if (!landmarks || !groupRef.current) return;

    // --- 1. FACE CALIBRATION & WIDTH ---
    const leftTemple = landmarks[234];
    const rightTemple = landmarks[454];
    const currentFaceWidth = getDistance(leftTemple, rightTemple);
    if (currentFaceWidth < 0.05) return;

    smoothedFaceWidth.current = lerp(smoothedFaceWidth.current, currentFaceWidth, GLOBAL_CONFIG.LERP_CALIBRATION);
    const currentCalibFactor = 1.0 / (smoothedFaceWidth.current || 0.1);
    smoothedCalibFactor.current = lerp(smoothedCalibFactor.current, currentCalibFactor, GLOBAL_CONFIG.LERP_CALIBRATION);

    // --- 2. COMPUTE FACE BASIS ---
    const toVec3 = (lm) => {
      const zBase = -(GLOBAL_CONFIG.DEPTH_MULTIPLIER * smoothedCalibFactor.current);
      
      let mappedX = (lm.x - 0.5) * 2;
      if (isMirrored) {
        mappedX = -mappedX; // Flip X for mirrored view
      }

      return new THREE.Vector3(
        mappedX,
        -(lm.y - 0.5) * 2,
        zBase - (lm.z * 2)
      );
    };

    const basis = computeFaceBasis(landmarks, toVec3);

    // --- 3. TARGET POSITIONING ---
    // Start at nose (basis.center)
    const targetPos = basis.center.clone();
    
    // Offset along face UP and FORWARD vectors
    targetPos.add(basis.up.clone().multiplyScalar(GLOBAL_CONFIG.HEAD_OFFSET_UP));
    targetPos.add(basis.forward.clone().multiplyScalar(GLOBAL_CONFIG.OFFSET_FORWARD));

    // Apply model-specific world-space offset (optional, kept for fine-tuning)
    targetPos.x += mConfig.offset[0];
    targetPos.y += mConfig.offset[1];
    targetPos.z += mConfig.offset[2];

    // --- APPLY FACE-RELATIVE CALIBRATION ---
    if (calibration) {
      // Use face normal (forward) for forward + depth
      const totalForward = (calibration.forward || 0) + (calibration.depth || 0);
      targetPos.add(basis.forward.clone().multiplyScalar(totalForward));
      
      // Use face up vector for vertical offset
      targetPos.add(basis.up.clone().multiplyScalar(calibration.yOffset));
    }

    // --- 4. TARGET ROTATION ---
    // Note: computeFaceBasis already uses right-handed coordinate system.
    // When mirrored, the right vector correctly flips, keeping rotation intact.
    const targetMatrix = new THREE.Matrix4().makeBasis(basis.right, basis.up, basis.forward);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(targetMatrix);

    // Add model-specific rotation
    if (mConfig.rotation.some(r => r !== 0)) {
      const extraRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(...mConfig.rotation));
      targetQuaternion.multiply(extraRot);
    }

    // --- 5. TARGET SCALE ---
    let targetScale = smoothedFaceWidth.current * GLOBAL_CONFIG.SCALE_MULTIPLIER * mConfig.scaleMultiplier;
    
    if (calibration) {
      targetScale *= calibration.scale;
    }

    // --- 6. APPLY WITH SMOOTHING ---
    const g = groupRef.current;
    
    g.position.lerp(targetPos, GLOBAL_CONFIG.LERP_POSITION);
    g.quaternion.slerp(targetQuaternion, GLOBAL_CONFIG.LERP_ROTATION);
    
    const s = lerp(g.scale.x, targetScale, GLOBAL_CONFIG.LERP_SCALE);
    g.scale.set(s, s, s);
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
};

export default CapModel;
