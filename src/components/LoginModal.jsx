import React, { useState } from 'react'

function LoginModal({ onClose, onLogin }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="login-container">
                <div className="login-left">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2>Try it on before you take it home.</h2>
                        <p style={{ marginTop: 8 }}>
                            Create a free account to save your try-ons.
                        </p>
                    </div>
                </div>

                <div className="login-right">
                    <h2>Create an account</h2>
                    <p className="login-subtitle">
                        Free forever. No credit card required.
                    </p>

                    <input type="text" placeholder="First name" className="input-field" value={name} onChange={e => setName(e.target.value)} />
                    <input type="email" placeholder="Email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} />

                    <button
                        className="btn btn-dark"
                        style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                        onClick={onLogin}
                    >
                        Create account &amp; start trying on
                    </button>

                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
                        By continuing you agree to our Terms and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginModal
