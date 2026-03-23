import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import GlassesModel from './GlassesModel';
import CapModel from './CapModel';

const ARCanvas = ({ landmarks, selectedModel, mode, calibration, isMirrored }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      pointerEvents: 'none',
    }}>
      <Canvas>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1} />

          {landmarks && mode === 'glasses' && (
            <GlassesModel 
              modelPath={selectedModel} 
              landmarks={landmarks} 
              calibration={calibration}
              isMirrored={isMirrored}
            />
          )}

          {landmarks && mode === 'caps' && (
            <CapModel 
              modelPath={selectedModel} 
              landmarks={landmarks} 
              calibration={calibration}
              isMirrored={isMirrored}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default ARCanvas;
