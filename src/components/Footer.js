import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation for translations
import '../themes/Footer.css';

const Footer = () => {
    const { t } = useTranslation(); // Hook for translations
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); // State for success or error message
    const [messageType, setMessageType] = useState(''); // State to determine message type (success or error)
    const [isLoading, setIsLoading] = useState(false); // State to track loading

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const response = await fetch('http://localhost:3001/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage(t('newsletter_success'));
                setMessageType('success');
                setEmail(''); // Clear the input field

                // Refresh page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                setMessage(result.message || t('newsletter_error'));
                setMessageType('error');
            }
        } catch (error) {
            setMessage(t('newsletter_error'));
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Newsletter Section */}
                <div className="footer-section newsletter">
                    <h3>{t('newsletter')}</h3>
                    <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                        <input
                            type="email"
                            placeholder={t('insert_email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? t('loading') : t('subscribe')}
                        </button>
                    </form>
                    {message && (
                        <p className={`newsletter-message ${messageType}`}>
                            {message}
                        </p>
                    )} {/* Display success or error message with dynamic class */}
                </div>

                {/* Quick Links Section */}
                <div className="footer-section quick-links">
                    <h3>{t('quick_links')}</h3>
                    <ul>
                        <li><Link to="/about">{t('about_us')}</Link></li>
                        <li><Link to="/contact">{t('contact_us')}</Link></li>
                        <li><Link to="/terms-and-conditions">{t('terms')}</Link></li>
                        <li><Link to="/privacy-policy">{t('privacy_policy')}</Link></li>
                    </ul>
                </div>

                {/* Social Media Section */}
                <div className="footer-section social-media">
                    <h3>{t('social_channels')}</h3>
                    <div className="social-icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-facebook-f"></i>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-x-twitter"></i>
                        </a>
                        <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-youtube"></i>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                            <i className="fab fa-tiktok"></i>
                        </a>
                    </div>
                </div>

                {/* Join Telegram Button */}
                <div className="footer-section join-button">
                    <h3>{t('join_telegram')}</h3>
                    <p>{t('join_telegram_text')}</p>
                    <button className="join-telegram">{t('join_telegram')}</button>
                </div>
            </div>

            <div className="footer-bottom">
                <p>{t('footer_bottom')}</p>
            </div>
        </footer>
    );
};

export default Footer;
