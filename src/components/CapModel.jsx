import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getDistance, computeFaceBasis, lerp } from '../utils/math';

/**
 * GLOBAL CONFIG FOR CAPS (Pose-based)
 */
const GLOBAL_CONFIG = {
  SCALE_MULTIPLIER: 1.8,      // Caps are roughly 1.8x eye distance in width
  HEAD_OFFSET_UP: 0.1,       // Adjusted for normalized space
  OFFSET_FORWARD: -0.05,      // Slightly back from nose bridge
  LERP_POSITION: 0.2,
  LERP_ROTATION: 0.15,
  LERP_SCALE: 0.15,
  LERP_CALIBRATION: 0.1,
};

/**
 * PER-MODEL BASE CORRECTIONS
 */
const MODEL_CONFIGS = {
  '/models/cap1.glb': {
    rotation: [-Math.PI / 2, 0, 0],
    scaleAdjust: 1.2,
    offset: [0, 0.05, 0]
  },
  '/models/cap2.glb': {
    rotation: [-Math.PI / 2, 0, 0],
    scaleAdjust: 1.0,
    offset: [0, 0, 0]
  }
};

const CapModel = ({ modelPath, landmarks, calibration, isMirrored }) => {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef();

  // Smoothing refs
  const smoothedFaceWidth = useRef(0.1);
  
  const mConfig = MODEL_CONFIGS[modelPath] || { rotation: [0,0,0], scaleAdjust: 1.0, offset: [0,0,0] };

  // 1. BASE NORMALIZATION (Applied once)
  const normalizedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    clone.position.sub(center);
    
    const scaleFactor = 1.0 / (size.x || 1.0);
    clone.scale.setScalar(scaleFactor * mConfig.scaleAdjust);
    
    if (mConfig.rotation) {
      clone.rotation.set(...mConfig.rotation);
    }
    
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
      const z = -lm.z * width;
      return new THREE.Vector3(x, y, z);
    };

    const basis = computeFaceBasis(landmarks, toVec3);

    // --- 3. TARGET POSITIONING ---
    const targetPos = basis.center.clone(); // Start at nose bridge
    
    // Offset along face UP and FORWARD vectors
    targetPos.add(basis.up.clone().multiplyScalar(GLOBAL_CONFIG.HEAD_OFFSET_UP));
    targetPos.add(basis.forward.clone().multiplyScalar(GLOBAL_CONFIG.OFFSET_FORWARD));

    if (calibration) {
      targetPos.add(basis.forward.clone().multiplyScalar(calibration.forward || 0));
      targetPos.add(basis.up.clone().multiplyScalar(calibration.yOffset || 0));
    }

    // --- 4. TARGET ROTATION (Face Orientation) ---
    const rotationMatrix = new THREE.Matrix4().makeBasis(basis.right, basis.up, basis.forward);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

    // --- 5. TARGET SCALE ---
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

export default CapModel;
