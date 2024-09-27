import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../themes/Confirmation.css'; // Import the CSS file

function ConfirmationPage() {
    const navigate = useNavigate(); // For navigation

    const handleReturnHome = () => {
        navigate('/');
    };

    return (
        <div className="confirmation-page">
            <div className="checkmark-container">
            </div>
            <h1>Payment Successful!✅</h1>
            <p>Your payment has been processed successfully, and an email has been sent to you with the appointment details.</p>
            <p>Thank you for booking your appointment!</p>
            <button onClick={handleReturnHome}>Return to Home</button>
        </div>
    );
}

export default ConfirmationPage;
