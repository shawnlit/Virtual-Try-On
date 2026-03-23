import React from 'react'

function Sidebar({ onOpenLogin, darkMode, onToggleTheme, currentView, setCurrentView }) {
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
                <button className="nav-item" onClick={onOpenLogin}>
                    Sign in
                </button>
            </div>
        </nav>
    )
}

export default Sidebar
