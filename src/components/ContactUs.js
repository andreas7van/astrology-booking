import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation for language switching
import '../themes/ContactUs.css';

const ContactUs = () => {
    const { t } = useTranslation(); // Hook for translations

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [statusMessage, setStatusMessage] = useState('');
    const [messageClass, setMessageClass] = useState(''); // Track success or error class
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage('');
        setMessageClass(''); // Reset the class each time the form is submitted

        try {
            const response = await fetch('http://localhost:3001/contact-us', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessageClass('success'); // Apply success class
                setStatusMessage(t('contact_us_success'));
                setFormData({ name: '', email: '', message: '' }); // Reset form

                // Set timeout to reload the page after 2 seconds
                setTimeout(() => {
                    window.location.reload(); // Reload the page
                }, 2000); // 2000 milliseconds = 2 seconds
            } else {
                setMessageClass('error'); // Apply error class
                setStatusMessage(result.message || t('contact_us_error'));
            }
        } catch (error) {
            setMessageClass('error'); // Apply error class
            setStatusMessage(t('contact_us_error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="contact-us-container">
            <div className="contact-us-content">
                <h1>{t('contact_us_heading')}</h1>
                <p>{t('contact_us_description')}</p>
                <form onSubmit={handleSubmit} className="contact-us-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('contact_us_name')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('contact_us_email')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder={t('contact_us_message')}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button" disabled={isLoading}>
                        {isLoading ? t('loading') : t('send_message')}
                    </button>
                </form>
                {statusMessage && (
                    <p className={`status-message ${messageClass}`}>
                        {statusMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ContactUs;
