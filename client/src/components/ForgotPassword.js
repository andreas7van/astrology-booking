import React, { useState } from 'react';
import '../themes/ForgotPassword.css'; // Assuming this is your CSS file for styling

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        console.log('Email being sent:', email);
        try {
            const response = await fetch('http://localhost:3001/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Password reset link sent to your email!');
                setEmail('');
                setErrorMessage('');
            } else {
                setErrorMessage(data.message || 'Email not found');
                setSuccessMessage('');
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again later.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="forgot-password-container">
            <h1>Forgot Password</h1>
            <form onSubmit={handleForgotPassword} className="forgot-password-form">
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" className="submit-button">Send Reset Link</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
