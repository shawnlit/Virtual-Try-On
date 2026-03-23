import React, { useRef, useState, useEffect } from 'react'
import CameraFeed from './CameraFeed'
import ARCanvas from './ARCanvas'
import { useFaceMesh } from '../hooks/useFaceMesh'

const MODES = {
  GLASSES: 'glasses',
  CAPS: 'caps'
}

const MODELS = {
  [MODES.GLASSES]: [
    { name: 'Glasses 1', path: '/models/glasses1.glb' },
    { name: 'Glasses 2', path: '/models/glasses2.glb' },
  ],
  [MODES.CAPS]: [
    { name: 'Cap 1', path: '/models/cap1.glb' },
    { name: 'Cap 2', path: '/models/cap2.glb' },
  ]
}

function CameraOverlay({ onClose, selectedProduct, onSaveLook }) {
    const videoRef = useRef(null)
    const landmarks = useFaceMesh(videoRef)
    
    const [mode, setMode] = useState(selectedProduct?.category === 'hats' ? MODES.CAPS : MODES.GLASSES)
    const [selectedModel, setSelectedModel] = useState(MODELS[mode][0].path)
    const [isMirrored, setIsMirrored] = useState(true)
    const [showCalibration, setShowCalibration] = useState(false)
    const [savedStatus, setSavedStatus] = useState(false)

    // Calibration state
    const [calibration, setCalibration] = useState({
        depth: 0,
        scale: 1,
        yOffset: 0,
        forward: 0.15
    })

    const [isShiftPressed, setIsShiftPressed] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Shift') setIsShiftPressed(true) }
        const handleKeyUp = (e) => { if (e.key === 'Shift') setIsShiftPressed(false) }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    const step = isShiftPressed ? 0.001 : 0.01

    useEffect(() => {
        const saved = localStorage.getItem("calibration")
        if (saved) {
            try {
                setCalibration(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse saved calibration", e)
            }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("calibration", JSON.stringify(calibration))
    }, [calibration])

    const resetCalibration = () => {
        setCalibration({
            depth: 0,
            scale: 1,
            yOffset: 0,
            forward: 0.15
        })
    }

    // Switch default model when mode changes or product changes
    useEffect(() => {
        if (selectedProduct) {
            const productMode = selectedProduct.category === 'hats' ? MODES.CAPS : MODES.GLASSES
            setMode(productMode)
            
            // If the product has a specific modelPath, use it.
            // Otherwise fall back to first model in category.
            if (selectedProduct.modelPath) {
                setSelectedModel(selectedProduct.modelPath)
            } else {
                setSelectedModel(MODELS[productMode][0].path)
            }
        }
    }, [selectedProduct])

    const handleSave = () => {
        onSaveLook({
            product: selectedProduct,
            date: new Date().toISOString()
        })
        setSavedStatus(true)
        setTimeout(() => setSavedStatus(false), 2000)
    }

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

            <div className="viewport-container" style={{ position: 'relative', width: '100%', height: 'calc(100% - 140px)', background: '#000', borderRadius: '24px', overflow: 'hidden' }}>
                <CameraFeed videoRef={videoRef} isMirrored={isMirrored} />
                <ARCanvas 
                    landmarks={landmarks} 
                    selectedModel={selectedModel} 
                    mode={mode}
                    calibration={calibration}
                    isMirrored={isMirrored}
                />
                
                {!landmarks && (
                    <div className="tracking-status">
                        Initializing Face Tracking...
                    </div>
                )}

                {savedStatus && (
                    <div className="tracking-status" style={{ background: 'rgba(16, 185, 129, 0.8)', color: '#fff' }}>
                        Look Saved to Gallery!
                    </div>
                )}

                {/* Mode Toggle inside the viewport */}
                <div className="mode-controls">
                    <button 
                        onClick={() => setMode(MODES.GLASSES)}
                        className={mode === MODES.GLASSES ? 'active' : ''}
                    >
                        GLASSES
                    </button>
                    <button 
                        onClick={() => setMode(MODES.CAPS)}
                        className={mode === MODES.CAPS ? 'active' : ''}
                    >
                        CAPS
                    </button>
                    <button 
                        onClick={() => setIsMirrored(!isMirrored)}
                        style={{ marginTop: '10px', background: isMirrored ? 'rgba(217, 119, 6, 0.6)' : 'rgba(0,0,0,0.4)' }}
                    >
                        {isMirrored ? 'MIRROR: ON' : 'MIRROR: OFF'}
                    </button>
                    <button 
                        onClick={() => setShowCalibration(true)}
                        style={{ marginTop: '10px', background: 'rgba(59, 130, 246, 0.6)' }}
                    >
                        CALIBRATE
                    </button>
                </div>

                {/* Model Selection inside the viewport */}
                <div className="model-controls">
                    {MODELS[mode].map((m) => (
                        <button 
                            key={m.path}
                            onClick={() => setSelectedModel(m.path)}
                            className={selectedModel === m.path ? 'active' : ''}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>

                {/* ENLARGED CALIBRATION UI */}
                {showCalibration && (
                <div className="calibration-ui-v2" style={{
                    position: "absolute",
                    bottom: "20px",
                    left: "20px",
                    width: "300px",
                    padding: "20px",
                    background: "rgba(0,0,0,0.85)",
                    borderRadius: "16px",
                    color: "white",
                    zIndex: 20,
                    backdropFilter: "blur(15px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                        <span style={{ fontWeight: "800", fontSize: "14px", letterSpacing: "1.5px", textTransform: "uppercase" }}>Calibration Controls</span>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            {isShiftPressed && <span className="fine-badge">FINE</span>}
                            <button 
                                onClick={() => setShowCalibration(false)}
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    border: "none",
                                    color: "white",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                            <span>Depth</span>
                            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{calibration.depth.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="-3"
                            max="3"
                            step={step}
                            style={{ width: "100%", height: "6px", cursor: "pointer" }}
                            value={calibration.depth}
                            onChange={(e) => setCalibration({ ...calibration, depth: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                            <span>Scale</span>
                            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{calibration.scale.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.2"
                            max="5"
                            step={step}
                            style={{ width: "100%", height: "6px", cursor: "pointer" }}
                            value={calibration.scale}
                            onChange={(e) => setCalibration({ ...calibration, scale: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                            <span>Vertical (Y)</span>
                            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{calibration.yOffset.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="-1"
                            max="1"
                            step={step}
                            style={{ width: "100%", height: "6px", cursor: "pointer" }}
                            value={calibration.yOffset}
                            onChange={(e) => setCalibration({ ...calibration, yOffset: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                            <span>Forward</span>
                            <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{calibration.forward.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step={step}
                            style={{ width: "100%", height: "6px", cursor: "pointer" }}
                            value={calibration.forward}
                            onChange={(e) => setCalibration({ ...calibration, forward: parseFloat(e.target.value) })}
                        />
                    </div>

                    <div style={{ fontSize: "10px", opacity: 0.6, marginBottom: "12px" }}>Hold SHIFT for fine control</div>

                    <button 
                        onClick={resetCalibration}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "10px",
                            border: "none",
                            background: "#fff",
                            color: "#000",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                            transition: "all 0.2s"
                        }}
                    >
                        RESET CALIBRATION
                    </button>
                </div>
                )}
            </div>

            <div className="camera-footer">
                <button 
                    className="save-look-btn" 
                    onClick={handleSave}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '12px'
                    }}
                >
                    Save Look
                </button>
                <button className="close-cam" onClick={onClose}>Stop Session</button>
            </div>
        </div>
    )
}

export default CameraOverlay
