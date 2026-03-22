import React, { useRef, useEffect } from 'react'

function CameraOverlay({ onClose, selectedProduct }) {
    const videoRef = useRef(null)

    useEffect(() => {
        let stream = null
        const start = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true })
                if (videoRef.current) videoRef.current.srcObject = stream
            } catch (err) {
                alert('Could not access camera: ' + err.message)
                onClose()
            }
        }
        start()
        return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
    }, [onClose])

    return (
        <div className="camera-overlay">
            <div className="camera-header">
                <h2>Live try-on</h2>
                {selectedProduct ? (
                    <div className="selected-product-badge">
                        {selectedProduct.emoji} {selectedProduct.name} — {selectedProduct.brand}
                    </div>
                ) : (
                    <p>Centre your face and hold still for a moment.</p>
                )}
            </div>

            <video ref={videoRef} autoPlay playsInline />

            <div className="camera-controls">
                <button className="close-cam" onClick={onClose}>Stop</button>
            </div>
        </div>
    )
}

export default CameraOverlay
