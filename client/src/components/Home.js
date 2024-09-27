import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation for translations
import '../themes/Home.css'; // Add the necessary styles here

function Home() {
    const { t } = useTranslation(); // Hook for translations
    const navigate = useNavigate();

    const handleBookAppointment = () => {
        navigate('/appointment'); // Redirect to the appointment page
    };

    return (
        <div className="home-container">
            <div className="home-content">
                <h1>{t('welcome_message')}</h1> {/* Translated welcome message */}
                <p>{t('description_paragraph1')}</p> {/* Translated description paragraph 1 */}
                <p>{t('description_paragraph2')}</p> {/* Translated description paragraph 2 */}
                <button className="book-appointment-button" onClick={handleBookAppointment}>
                    {t('book_appointment_button')} {/* Translated button text */}
                </button>
            </div>
        </div>
    );
}

export default Home;
