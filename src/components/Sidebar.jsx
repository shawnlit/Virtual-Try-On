import React from 'react'
import { useAuth } from '../context/AuthContext'

function Sidebar({ onOpenLogin, onLogout, darkMode, onToggleTheme, currentView, setCurrentView }) {
    const { user } = useAuth()
    const navItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'glasses', label: 'Glasses' },
        { id: 'hats', label: 'Hats & Caps' },
        { id: 'saved', label: 'Saved Looks' },
        { id: 'history', label: 'History' },
        { id: 'settings', label: 'Settings' },
    ]

    return (
        <nav className="sidebar">
            <div className="logo" onClick={() => setCurrentView('dashboard')} style={{cursor: 'pointer'}}>
                Virtual<span className="logo-dot">.</span>Fit
            </div>

            <div className="nav-section-label">Menu</div>
            {navItems.map(({ id, label }) => (
                <button 
                    key={id} 
                    className={`nav-item${currentView === id ? ' active' : ''}`}
                    onClick={() => setCurrentView(id)}
                >
                    {label}
                </button>
            ))}

            <div style={{ marginTop: 'auto' }}>
                <button className="theme-row" onClick={onToggleTheme}>
                    <span>{darkMode ? 'Dark mode' : 'Light mode'}</span>
                    <div className={`toggle-pill${darkMode ? ' on' : ''}`}>
                        <div className="toggle-knob" />
                    </div>
                </button>

                <div className="nav-section-label">Account</div>
                {user ? (
                    <>
                        <div className="nav-item" style={{ opacity: 0.8, pointerEvents: 'none' }}>
                            Hi, {user.user_metadata?.full_name || user.email}
                        </div>
                        <button className="nav-item" onClick={onLogout}>
                            Sign out
                        </button>
                    </>
                ) : (
                    <button className="nav-item" onClick={onOpenLogin}>
                        Sign in
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Sidebar
