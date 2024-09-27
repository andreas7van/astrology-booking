import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../themes/ResetPassword.css'; // Υποθέτουμε ότι το CSS αρχείο υπάρχει

const ResetPassword = () => {
    const { token } = useParams(); // Παίρνουμε το reset token από το URL
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleResetPassword = async (e) => {
        e.preventDefault();
    
        if (password !== confirmPassword) {
            setErrorMessage('Οι κωδικοί πρόσβασης δεν ταιριάζουν.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3001/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword: password }), // Σωστή ονομασία 'newPassword'
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setSuccessMessage('Ο κωδικός σας επαναφέρθηκε με επιτυχία!');
                setTimeout(() => {
                    navigate('/admin-login');
                }, 2000); // Μετά από 2 δευτερόλεπτα πηγαίνει στη σελίδα εισόδου
            } else {
                setErrorMessage(data.message || 'Η επαναφορά κωδικού απέτυχε.');
            }
        } catch (error) {
            setErrorMessage('Κάτι πήγε στραβά. Προσπαθήστε ξανά.');
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Επαναφορά Κωδικού Πρόσβασης</h1>
            <form onSubmit={handleResetPassword} className="reset-password-form">
                <div className="form-group">
                    <label>Νέος Κωδικός Πρόσβασης</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Επιβεβαίωση Κωδικού</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                <button type="submit" className="submit-button">Επαναφορά Κωδικού</button>
            </form>
        </div>
    );
};

export default ResetPassword;
