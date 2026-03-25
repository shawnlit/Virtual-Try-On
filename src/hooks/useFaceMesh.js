import { useEffect, useRef, useState } from 'react';

export const useFaceMesh = (videoRef) => {
  const faceMeshRef = useRef(null);
  const [landmarks, setLandmarks] = useState(null);
  const requestRef = useRef();

  useEffect(() => {
    // MediaPipe Face Mesh is a client-side library
    let active = true;

    async function setupFaceMesh() {
      const mpFaceMesh = await import('@mediapipe/face_mesh');
      console.log("MediaPipe FaceMesh module:", mpFaceMesh);

      // Handle different export styles (named, default, or default.FaceMesh)
      const FaceMesh = mpFaceMesh.FaceMesh || 
                       (mpFaceMesh.default && mpFaceMesh.default.FaceMesh) || 
                       mpFaceMesh.default;

      console.log("Resolved FaceMesh constructor:", FaceMesh);

      if (typeof FaceMesh !== 'function') {
        console.error("FaceMesh is not a constructor! Type:", typeof FaceMesh);
      }

      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          // Using a fixed version to ensure compatibility with the NPM package version
          const version = '0.4.1633559619';
          const url = `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${version}/${file}`;
          console.log("Loading MediaPipe asset:", url);
          return url;
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
