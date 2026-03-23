import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import HeroSection from './components/HeroSection'
import ProductGallery from './components/ProductGallery'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import LoginModal from './components/LoginModal'
import CameraOverlay from './components/CameraOverlay'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showLogin, setShowLogin] = useState(false)
    const [showCamera, setShowCamera] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [darkMode, setDarkMode] = useState(false)

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    const handleOpenTryOn = (product = null) => {
        if (!isLoggedIn) {
            setSelectedProduct(product)
            setShowLogin(true)
        } else {
            setSelectedProduct(product)
            setShowCamera(true)
        }
    }

    const handleLogin = () => {
        setIsLoggedIn(true)
        setShowLogin(false)
        setTimeout(() => setShowCamera(true), 400)
    }

    return (
        <>
            <div className="animated-bg" />
            <Sidebar
                onOpenLogin={() => setShowLogin(true)}
                darkMode={darkMode}
                onToggleTheme={() => setDarkMode(d => !d)}
            />

            <main className="main-content">
                <HeroSection onOpenModal={() => handleOpenTryOn()} />
                <ProductGallery onTryOnClick={handleOpenTryOn} />
                <HowItWorks />
                <Testimonials />
            </main>

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
            )}

            {showCamera && (
                <CameraOverlay
                    onClose={() => { setShowCamera(false); setSelectedProduct(null) }}
                    selectedProduct={selectedProduct}
                />
            )}
        </>
    )
}

export default App
