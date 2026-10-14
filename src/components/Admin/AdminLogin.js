import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { adminLogin } from '../../adminApi';
import '../CSS/Admin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const { isBackendOnline } = useData();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [needsMfa, setNeedsMfa] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isBackendOnline) {
                const { response, data } = await adminLogin({
                    username,
                    password,
                    ...(otpCode ? { otp_code: otpCode } : {})
                });

                if (response.ok && data.success) {
                    navigate('/admin');
                } else {
                    if (data.code === 'mfa_required') setNeedsMfa(true);
                    setError(data.code === 'mfa_required'
                        ? 'Enter the code from your authenticator app.'
                        : data.error || 'Invalid administrator credentials');
                }
            } else {
                setError('The backend is unavailable. Please try again later.');
            }
        } catch (err) {
            console.error("Login request error", err);
            setError(err.message || 'Connection failed. Verify if Django backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-wrapper">
            <div className="admin-login-card">
                <h1>Print-IN 3D</h1>
                <p>Administrator Control Studio</p>

                {error && <div className="login-error-box">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="login-form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            required
                            className="login-form-control"
                            placeholder="e.g. admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="login-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            className="login-form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {needsMfa && (
                        <div className="login-form-group">
                            <label htmlFor="otp-code">Authenticator code</label>
                            <input
                                id="otp-code"
                                className="login-form-control"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                value={otpCode}
                                onChange={e => setOtpCode(e.target.value)}
                            />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn-admin-login">
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
