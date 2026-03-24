import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import HeroSection from './components/HeroSection'
import ProductGallery from './components/ProductGallery'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import LoginModal from './components/LoginModal'
import CameraOverlay from './components/CameraOverlay'

function App() {
    const [user, setUser] = useState(null)
    const [showLogin, setShowLogin] = useState(false)
    const [showCamera, setShowCamera] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [darkMode, setDarkMode] = useState(false)
    const [currentView, setCurrentView] = useState('dashboard')
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('tryon_history')
        return saved ? JSON.parse(saved) : []
    })
    const [savedLooks, setSavedLooks] = useState(() => {
        const saved = localStorage.getItem('saved_looks')
        return saved ? JSON.parse(saved) : []
    })

    const isLoggedIn = !!user

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    useEffect(() => {
        localStorage.setItem('tryon_history', JSON.stringify(history))
    }, [history])

    useEffect(() => {
        localStorage.setItem('saved_looks', JSON.stringify(savedLooks))
    }, [savedLooks])

    const handleOpenTryOn = (product = null) => {
        if (product) {
            setHistory(prev => {
                const filtered = prev.filter(p => p.id !== product.id)
                return [product, ...filtered].slice(0, 10)
            })
        }

        if (!isLoggedIn) {
            setSelectedProduct(product)
            setShowLogin(true)
        } else {
            setSelectedProduct(product)
            setShowCamera(true)
        }
    }

    const handleLogin = (userData) => {
        setUser(userData)
        setShowLogin(false)
        if (selectedProduct) {
            setTimeout(() => setShowCamera(true), 400)
        }
    }

    const handleLogout = () => {
        setUser(null)
        setCurrentView('dashboard')
    }

    const handleSaveLook = (look) => {
        setSavedLooks(prev => [look, ...prev])
    }

    const renderContent = () => {
        switch (currentView) {
            case 'dashboard':
            case 'glasses':
            case 'hats':
                return (
                    <>
                        <HeroSection onOpenModal={() => handleOpenTryOn()} />
                        <ProductGallery 
                            onTryOnClick={handleOpenTryOn} 
                            activeTab={currentView === 'dashboard' ? 'all' : currentView}
                        />
                        <HowItWorks />
                        <Testimonials />
                    </>
                )
            case 'saved':
                return (
                    <section className="section">
                        <div className="section-label">Saved Looks</div>
                        <div className="product-grid">
                            {savedLooks.length > 0 ? savedLooks.map((look, i) => (
                                <div key={i} className="product-card">
                                    <span className="product-card-emoji">{look.product?.emoji || '📸'}</span>
                                    <div className="product-card-name">Look #{savedLooks.length - i}</div>
                                    <div className="product-card-brand">{look.product?.name || 'Custom Look'}</div>
                                    <div className="product-card-price" style={{fontSize: '10px'}}>{new Date(look.date).toLocaleString()}</div>
                                </div>
                            )) : (
                                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', opacity: 0.6}}>
                                    No saved looks yet. Try something on!
                                </div>
                            )}
                        </div>
                    </section>
                )
            case 'history':
                return (
                    <section className="section">
                        <div className="section-label">History</div>
                        <div className="product-grid">
                            {history.length > 0 ? history.map((product, i) => (
                                <div key={i} className="product-card">
                                    <button className="product-card-try-btn" onClick={() => handleOpenTryOn(product)}>Try on</button>
                                    <span className="product-card-emoji">{product.emoji}</span>
                                    <div className="product-card-name">{product.name}</div>
                                    <div className="product-card-brand">{product.brand}</div>
                                    <div className="product-card-price">{product.price}</div>
                                </div>
                            )) : (
                                <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', opacity: 0.6}}>
                                    No history yet. Start exploring!
                                </div>
                            )}
                        </div>
                    </section>
                )
            case 'settings':
                return (
                    <section className="section">
                        <div className="section-label">Settings</div>
                        <div className="settings-container" style={{maxWidth: '600px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '16px'}}>
                            <div className="settings-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                <div>
                                    <div style={{fontWeight: 'bold'}}>Dark Mode</div>
                                    <div style={{fontSize: '12px', opacity: 0.6}}>Toggle the application theme</div>
                                </div>
                                <button className="theme-row" onClick={() => setDarkMode(d => !d)} style={{margin: 0, padding: 0, background: 'none', width: 'auto'}}>
                                    <div className={`toggle-pill${darkMode ? ' on' : ''}`}>
                                        <div className="toggle-knob" />
                                    </div>
                                </button>
                            </div>
                            <div className="settings-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                                <div>
                                    <div style={{fontWeight: 'bold'}}>Clear History</div>
                                    <div style={{fontSize: '12px', opacity: 0.6}}>Remove all your try-on history</div>
                                </div>
                                <button 
                                    onClick={() => setHistory([])}
                                    style={{padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer'}}
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="settings-row" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0'}}>
                                <div>
                                    <div style={{fontWeight: 'bold'}}>Privacy Mode</div>
                                    <div style={{fontSize: '12px', opacity: 0.6}}>Camera data is processed locally</div>
                                </div>
                                <div style={{color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}>SECURE</div>
                            </div>
                        </div>
                    </section>
                )
            default:
                return null
        }
    }

    return (
        <>
            <div className="animated-bg" />
            <Sidebar
                user={user}
                onOpenLogin={() => setShowLogin(true)}
                onLogout={handleLogout}
                darkMode={darkMode}
                onToggleTheme={() => setDarkMode(d => !d)}
                currentView={currentView}
                setCurrentView={setCurrentView}
            />

            <main className="main-content">
                {renderContent()}
            </main>

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
            )}

            {showCamera && (
                <CameraOverlay
                    onClose={() => { setShowCamera(false); setSelectedProduct(null) }}
                    selectedProduct={selectedProduct}
                    onSaveLook={handleSaveLook}
                />
            )}
        </>
    )
}

export default App
