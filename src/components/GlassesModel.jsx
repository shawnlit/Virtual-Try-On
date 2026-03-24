import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getDistance, computeFaceBasis, lerp } from '../utils/math';

/**
 * GLOBAL CONFIG (Pose-based)
 */
const GLOBAL_CONFIG = {
  SCALE_MULTIPLIER: 1.15,    // Scaled relative to eye-to-eye distance
  OFFSET_FORWARD: 0.02,      
  LERP_POSITION: 0.2,       
  LERP_ROTATION: 0.15,       
  LERP_SCALE: 0.15,           
  LERP_CALIBRATION: 0.1,    
};

/**
 * PER-MODEL BASE CORRECTIONS (Applied once)
 */
const MODEL_CONFIGS = {
  '/models/glasses1.glb': {
    rotation: [-Math.PI / 2, 0, 0], // Correction for Z-up
    scaleAdjust: 1.0,
    offset: [0, 0, 0]
  },
  '/models/glasses2.glb': {
    rotation: [-Math.PI / 2, 0, 0], // Correction for Z-up
    scaleAdjust: 1.05,
    offset: [0, 0, 0]
  }
};

const GlassesModel = ({ modelPath, landmarks, calibration, isMirrored }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();

  // Smoothing refs
  const smoothedFaceWidth = useRef(0.1);
  
  const mConfig = MODEL_CONFIGS[modelPath] || { rotation: [0,0,0], scaleAdjust: 1.0, offset: [0,0,0] };

  // 1. BASE NORMALIZATION (Applied once to the model child)
  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Center the model
    clone.position.sub(center);
    
    // Normalize width to 1.0
    const scaleFactor = 1.0 / (size.x || 1.0);
    clone.scale.setScalar(scaleFactor * mConfig.scaleAdjust);
    
    // Apply base rotation correction
    if (mConfig.rotation) {
      clone.rotation.set(...mConfig.rotation);
    }
    
    // Apply fine-tuning offset
    if (mConfig.offset) {
      clone.position.add(new THREE.Vector3(...mConfig.offset));
    }

    return clone;
  }, [scene, mConfig]);

  useFrame(({ viewport, camera }) => {
    if (!landmarks || !groupRef.current) return;

    // --- 1. FACE CALIBRATION & WIDTH (Using 33 and 263) ---
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const currentFaceWidth = getDistance(leftEye, rightEye);
    if (currentFaceWidth < 0.01) return;

    smoothedFaceWidth.current = lerp(smoothedFaceWidth.current, currentFaceWidth, GLOBAL_CONFIG.LERP_CALIBRATION);

    // --- 2. COORDINATE MAPPING ---
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 0]);

    const toVec3 = (lm) => {
      let x = (lm.x - 0.5) * width;
      let y = -(lm.y - 0.5) * height;
      if (isMirrored) x = -x;
      const z = -lm.z * width; // Z positive towards camera
      return new THREE.Vector3(x, y, z);
    };

    const basis = computeFaceBasis(landmarks, toVec3);

    // --- 3. TARGET POSITIONING ---
    const targetPos = basis.center.clone(); 
    targetPos.add(basis.forward.clone().multiplyScalar(GLOBAL_CONFIG.OFFSET_FORWARD));

    if (calibration) {
      targetPos.add(basis.forward.clone().multiplyScalar(calibration.forward || 0));
      targetPos.add(basis.up.clone().multiplyScalar(calibration.yOffset || 0));
    }

    // --- 4. TARGET ROTATION (Face Orientation) ---
    // We map Model +X -> basis.right, Model +Y -> basis.up, Model +Z -> basis.forward
    const rotationMatrix = new THREE.Matrix4().makeBasis(basis.right, basis.up, basis.forward);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

    // --- 5. TARGET SCALE ---
    // Since model is normalized to width 1.0, group scale = desired world width
    let targetScale = smoothedFaceWidth.current * width * GLOBAL_CONFIG.SCALE_MULTIPLIER;
    if (calibration) targetScale *= calibration.scale;

    // --- 6. APPLY TO GROUP ---
    const g = groupRef.current;
    g.position.lerp(targetPos, GLOBAL_CONFIG.LERP_POSITION);
    g.quaternion.slerp(targetQuaternion, GLOBAL_CONFIG.LERP_ROTATION);
    const s = lerp(g.scale.x, targetScale, GLOBAL_CONFIG.LERP_SCALE);
    g.scale.set(s, s, s);
  });


  return (
    <group ref={groupRef}>
       <primitive object={normalizedScene} />
       <axesHelper args={[0.5]} />
    </group>
  );
};

export default GlassesModel;
