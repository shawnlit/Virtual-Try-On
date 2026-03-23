import { useEffect, useRef, useState } from 'react';

export const useFaceMesh = (videoRef) => {
  const faceMeshRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const requestRef = useRef();

  useEffect(() => {
    // MediaPipe Face Mesh is a client-side library
    let active = true;

    async function setupFaceMesh() {
      const { FaceMesh } = await import('@mediapipe/face_mesh');

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
