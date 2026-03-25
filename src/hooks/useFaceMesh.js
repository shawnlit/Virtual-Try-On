import { useEffect, useRef, useState } from 'react';
import * as FaceMeshModule from '@mediapipe/face_mesh';

export const useFaceMesh = (videoRef) => {
  const faceMeshRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const requestRef = useRef();

  useEffect(() => {
    // MediaPipe Face Mesh is a client-side library
    let active = true;

    async function setupFaceMesh() {
      console.log("FaceMeshModule:", FaceMeshModule);
      
      // Resolve the constructor (FaceMeshModule.FaceMesh, FaceMeshModule.default.FaceMesh, or FaceMeshModule.default)
      const FaceMesh = FaceMeshModule.FaceMesh || 
                       (FaceMeshModule.default && FaceMeshModule.default.FaceMesh) || 
                       FaceMeshModule.default;
      
      console.log("Resolved FaceMesh:", FaceMesh);

      if (typeof FaceMesh !== 'function') {
        console.error("FaceMesh is not a constructor! Type:", typeof FaceMesh);
        return;
      }

      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results) => {
        if (!active) return;
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          setLandmarks(results.multiFaceLandmarks[0]);
        } else {
          setLandmarks(null);
        }
      });

      faceMeshRef.current = faceMesh;
    }

    setupFaceMesh();

    return () => {
      active = false;
      if (faceMeshRef.current) {
        faceMeshRef.current.close();
      }
    };
  }, []);

  const detect = async () => {
    if (
      videoRef.current &&
      videoRef.current.readyState === 4 &&
      faceMeshRef.current
    ) {
      await faceMeshRef.current.send({ image: videoRef.current });
    }
    requestRef.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return landmarks;
};
