import * as THREE from 'three';

export const getMidpoint = (p1, p2) => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
  z: (p1.z + p2.z) / 2,
});

export const getDistance = (p1, p2) => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

export const getAngle = (p1, p2) => {
  // Angle in Z axis based on X-Y plane difference
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

export const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

export const lerpPoint = (p1, p2, t) => {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t),
    z: lerp(p1.z, p2.z, t),
  };
};

/**
 * Computes a right-handed coordinate system for the face.
 * @param {Array} landmarks - MediaPipe face landmarks
 * @param {Function} toVec3 - Converter to THREE space
 */
export const computeFaceBasis = (landmarks, toVec3) => {
  const noseBridge = toVec3(landmarks[168]);
  const noseTip = toVec3(landmarks[1]);
  const forehead = toVec3(landmarks[10]);

  // 1. Forward vector: from nose bridge to nose tip
  // This points out of the face.
  const forward = new THREE.Vector3().subVectors(noseTip, noseBridge).normalize();
  
  // 2. Initial Up vector: from nose bridge to forehead
  const initialUp = new THREE.Vector3().subVectors(forehead, noseBridge).normalize();
  
  // 3. Right vector: cross product of initialUp and forward
  // Ensures right is perpendicular to both.
  const right = new THREE.Vector3().crossVectors(initialUp, forward).normalize();
  
  // 4. Final Up vector: cross product of forward and right
  // Ensures all three are perfectly orthogonal.
  const up = new THREE.Vector3().crossVectors(forward, right).normalize();

  return {
    right,
    up,
    forward,
    center: noseBridge
  };
};
