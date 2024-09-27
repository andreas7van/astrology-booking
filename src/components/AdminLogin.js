import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import '../themes/AdminLogin.css';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { isLoggedIn, login } = useContext(AuthContext);

    // Έλεγχος αν ο χρήστης είναι ήδη συνδεδεμένος
    useEffect(() => {
        // Βεβαιώσου ότι το navigate καλείται μόνο όταν ο χρήστης είναι ήδη συνδεδεμένος
        if (isLoggedIn) {
            navigate('/admin');
        }
    }, [isLoggedIn, navigate]);  // Προσθήκη σωστών εξαρτήσεων

    // Διαχείριση login
    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:3001/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Αποθήκευση του token
                login(data.token); // Χρήση του context για αποθήκευση
                localStorage.setItem('token', data.token); // Αποθήκευση του token στο localStorage
                navigate('/admin');
            } else {
                setErrorMessage(data.message || 'Invalid username or password');
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again later.');
        }
    };

    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    return (
        <div className="admin-login-container">
            <h1>Admin Login</h1>
            <form onSubmit={handleLogin} className="admin-login-form">
                <div className="form-group">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                <button type="submit" className="login-button">Login</button>

                <div className="forgot-password">
                    <p onClick={handleForgotPassword}>Forgot Password?</p>
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;
