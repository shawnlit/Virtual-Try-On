import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getDistance, computeFaceBasis, lerp } from '../utils/math';

/**
 * GLOBAL CONFIG (Pose-based)
 */
const GLOBAL_CONFIG = {
  SCALE_MULTIPLIER: 2.85,    
  DEPTH_MULTIPLIER: 1.2,     
  OFFSET_FORWARD: 0.08,      // Push slightly in front of nose bridge
  OFFSET_UP: -0.02,          // Slight vertical adjustment along face up vector
  LERP_POSITION: 0.4,       
  LERP_ROTATION: 0.25,       
  LERP_SCALE: 0.1,           
  LERP_CALIBRATION: 0.05,    
};

/**
 * PER-MODEL NORMALIZATION CONFIG
 */
const MODEL_CONFIGS = {
  '/models/glasses1.glb': {
    scaleMultiplier: 1.05,
    offset: [0, 0, 0],
    rotation: [0, 0, 0]
  },
  '/models/glasses2.glb': {
    scaleMultiplier: 1.15,
    offset: [0, 0.02, 0.05],
    rotation: [0, 0, 0]
  }
};

const GlassesModel = ({ modelPath, landmarks, calibration, isMirrored }) => {
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
    
    // Offset along face FORWARD and UP vectors
    targetPos.add(basis.forward.clone().multiplyScalar(GLOBAL_CONFIG.OFFSET_FORWARD));
    targetPos.add(basis.up.clone().multiplyScalar(GLOBAL_CONFIG.OFFSET_UP));

    // Apply model-specific world-space offset
    targetPos.x += mConfig.offset[0];
    targetPos.y += mConfig.offset[1];
    targetPos.z += mConfig.offset[2];

    // --- APPLY FACE-RELATIVE CALIBRATION ---
    if (calibration) {
      // Use face normal (forward) for forward + depth
      // Combining depth and forward as both move along the face normal
      const totalForward = (calibration.forward || 0) + (calibration.depth || 0);
      targetPos.add(basis.forward.clone().multiplyScalar(totalForward));
      
      // Use face up vector for vertical offset
      targetPos.add(basis.up.clone().multiplyScalar(calibration.yOffset));
    }

    // --- 4. TARGET ROTATION (Roll only) ---
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const dy = rightEye.y - leftEye.y;
    const dx = rightEye.x - leftEye.x;
    
    // Invert roll if mirrored to keep direction correct
    let rollAngle = -Math.atan2(dy, dx); 
    if (isMirrored) {
      rollAngle = -rollAngle;
    }

    const targetQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, 0, rollAngle + mConfig.rotation[2])
    );

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

export default GlassesModel;
