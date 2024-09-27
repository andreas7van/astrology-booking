import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';  // Import Link
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Home from './components/Home';
import PaymentForm from './components/PaymentForm';
import AppointmentForm from './components/AppointmentForm';
import ConfirmationPage from './components/Confirmation';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import './themes/App.css';
import greeceFlag from './images/greece.ico';
import englandFlag from './images/england.ico';
import homeButtonIcon from './images/3293413.png';  // Import the home button image

import { useTranslation } from 'react-i18next';
import './i18n';
import AuthProvider, { AuthContext } from './AuthContext';  // Import the AuthProvider

// Stripe configuration
const stripePromise = loadStripe('pk_test_51Pt9uHItak2RtXorQb9qfC1o2jOqv7QvqKeuhl4SGkT5W7JJltm8AOVcfN797N45mWlBd77VH3ENvjlrW9BZaLNx00mxTfVZ5a');

function App() {
    const { t, i18n } = useTranslation();
    
    const [appointmentData, setAppointmentData] = useState(null);

    // Function to handle payment success
    const handlePaymentSuccess = (paymentMethod) => {
        console.log("Payment successful:", paymentMethod);
        // Additional logic on successful payment can be handled here.
    };

    // Function to switch languages
    const switchLanguage = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <AuthProvider>
            <Router>
                <div>
                    {/* Home Button */}
                    <div className="home-button">
                        <Link to="/">
                            <img src={homeButtonIcon} alt="Home" style={{ width: '50px', cursor: 'pointer' }} />
                        </Link>
                    </div>

                    {/* Language switcher */}
                    <div className="language-switcher">
                        <img
                            src={greeceFlag}
                            alt={t('greek_language')}
                            onClick={() => switchLanguage('gr')}
                            style={{ cursor: 'pointer', marginRight: '10px' }}
                        />
                        <img
                            src={englandFlag}
                            alt={t('english_language')}
                            onClick={() => switchLanguage('en')}
                            style={{ cursor: 'pointer' }}
                        />
                    </div>

                    <div className="app-container">
                        <AuthContext.Consumer>
                            {({ isLoggedIn }) => (
                                <Routes>
                                    {/* Public Routes */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/appointment" element={<AppointmentForm onFormSubmit={setAppointmentData} />} />
                                    <Route 
                                        path="/payment" 
                                        element={appointmentData ? (
                                            <Elements stripe={stripePromise}>
                                                <PaymentForm appointmentDetails={appointmentData} onPaymentSuccess={handlePaymentSuccess} />
                                            </Elements>
                                        ) : (
                                            <Navigate to="/appointment" />
                                        )}
                                    />
                                    <Route path="/confirmation" element={<ConfirmationPage />} />
                                    <Route path="/about" element={<AboutUs />} />
                                    <Route path="/contact" element={<ContactUs />} />
                                    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                                    {/* Admin Route with Protected Access */}
                                    <Route
                                        path="/admin"
                                        element={isLoggedIn ? <AdminPanel /> : <Navigate to="/admin-login" />}
                                    />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                                    {/* Admin Login Page */}
                                    <Route path="/admin-login" element={<AdminLogin />} />
                                </Routes>
                            )}
                        </AuthContext.Consumer>
                    </div>

                    {/* Footer Component */}
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
