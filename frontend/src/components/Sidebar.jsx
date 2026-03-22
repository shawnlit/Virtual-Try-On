import React from 'react'

function Sidebar({ onOpenLogin, darkMode, onToggleTheme }) {
    const navItems = [
        { label: 'Dashboard', active: true },
        { label: 'Glasses' },
        { label: 'Hats & Caps' },
        { label: 'Saved Looks' },
        { label: 'History' },
        { label: 'Settings' },
    ]

    return (
        <nav className="sidebar">
            <div className="logo">
                Virtual<span className="logo-dot">.</span>Fit
            </div>

            <div className="nav-section-label">Menu</div>
            {navItems.map(({ label, active }) => (
                <button key={label} className={`nav-item${active ? ' active' : ''}`}>
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
