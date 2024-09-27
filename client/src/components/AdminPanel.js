import React, { useState, useEffect, useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, Navigate } from 'react-router-dom';
import '../themes/AdminPanel.css'; // Add styles for the Admin Panel
import { AuthContext } from '../AuthContext';
import LogoutIcon from '../images/log-out-outline.svg'; // Εισαγωγή της εικόνας του κουμπιού αποσύνδεσης

const AdminPanel = () => {
    const [availableDates, setAvailableDates] = useState([]);
    const [appointments, setAppointments] = useState([]); // Αρχικοποιείται ως πίνακας
    const [newDate, setNewDate] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [subject, setSubject] = useState(''); // Νέο state για το θέμα του μηνύματος
    const [newsletterMessage, setNewsletterMessage] = useState(''); // Νέο state για το περιεχόμενο του μηνύματος
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useContext(AuthContext);

    // Προσθήκη του token σε όλα τα προστατευμένα αιτήματα
    const token = localStorage.getItem('token');

    // Fetch διαθέσιμες ημερομηνίες από το backend
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await fetch('http://localhost:3001/availability', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                    },
                });
                const data = await response.json();
                setAvailableDates(data);
            } catch (error) {
                console.error('Error fetching availability:', error);
            }
        };

        fetchAvailability();
    }, [token]);

    // Fetch ραντεβού από το backend
    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('http://localhost:3001/admin/appointments', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Προσθήκη του token στα headers
                    },
                });
                const data = await response.json();
    
                if (response.ok) {
                    setAppointments(data);
                } else {
                    setErrorMessage(data.message || 'Error fetching appointments');
                }
            } catch (error) {
                setErrorMessage('Something went wrong. Please try again later.');
            }
        };

        fetchAppointments();
    }, [token]);

    // Προσθήκη νέας διαθεσιμότητας
    const handleAddAvailability = async () => {
        if (!newDate || !newTime) {
            setErrorMessage('All fields are required!');
            return;
        }

        setErrorMessage('');

        const availability = {
            date: newDate.toISOString().slice(0, 10), // Μορφοποίηση ημερομηνίας
            time: newTime,
        };

        try {
            const response = await fetch('http://localhost:3001/admin/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                },
                body: JSON.stringify(availability),
            });

            const result = await response.json();

            if (response.ok) {
                setAvailableDates([...availableDates, result.availability]);
                setNewDate(null);
                setNewTime('');
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Error adding availability:', error);
            setErrorMessage('Something went wrong. Please try again.');
        }
    };

    // Διαγραφή διαθεσιμότητας
    const handleDeleteAvailability = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/admin/availability/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                },
            });

            if (response.ok) {
                const updatedDates = availableDates.filter((availability) => availability._id !== id);
                setAvailableDates(updatedDates);
            }
        } catch (error) {
            console.error('Error deleting availability:', error);
        }
    };

    // Επιλογή ραντεβού
    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment); // Αποθήκευση της επιλεγμένης κράτησης
    };

    // Διαγραφή ραντεβού και ενημέρωση διαθεσιμότητας
    const handleAppointmentDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3001/admin/appointments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                },
            });
    
            if (response.ok) {
                // Ανανέωση των κλεισμένων ραντεβού μετά τη διαγραφή
                const updatedAppointments = appointments.filter((appointment) => appointment._id !== id);
                setAppointments(updatedAppointments);
    
                // Ανανέωση της λίστας διαθεσιμοτήτων
                const availabilityResponse = await fetch('http://localhost:3001/availability', {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                    },
                });
                const availabilities = await availabilityResponse.json();
                setAvailableDates(availabilities);
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
        }
    };

    // Αν ο χρήστης δεν είναι συνδεδεμένος, ανακατεύθυνση στο login
    if (!isLoggedIn) {
        return <Navigate to="/admin-login" />;
    }

    const handleLogout = () => {
        logout(); // Καλεί τη μέθοδο logout από το AuthContext
        navigate('/admin-login'); // Ανακατεύθυνση στη σελίδα login
    };

    // Συνάρτηση για αποστολή μηνύματος στους συνδρομητές
    const handleSendNewsletter = async () => {
        if (!subject || !newsletterMessage) {
            setErrorMessage('Το θέμα και το μήνυμα είναι υποχρεωτικά!');
            return;
        }

        try {
            const response = await fetch('http://localhost:3001/admin/send-newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Προσθήκη του token στις headers
                },
                body: JSON.stringify({ subject, message: newsletterMessage }),
            });

            const result = await response.json();

            if (response.ok) {
                alert('Το newsletter στάλθηκε επιτυχώς!');
                setSubject('');
                setNewsletterMessage('');
            } else {
                setErrorMessage(result.message);
            }
        } catch (error) {
            console.error('Error sending newsletter:', error);
            setErrorMessage('Κάτι πήγε στραβά. Προσπαθήστε ξανά αργότερα.');
        }
    };

    return (
        <div className="admin-panel-container">
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button className="logout-button" onClick={handleLogout}>
                    <img src={LogoutIcon} alt="Logout" className="logout-icon" />
                    Logout
                </button>
            </div>

            <div className="admin-availability-section">
                <h2>Add Available Hours and Dates</h2>

                <div className="admin-availability-form">
                    <label>
                        Select Date:
                        <DatePicker
                            selected={newDate}
                            onChange={(date) => setNewDate(date)}
                            dateFormat="yyyy-MM-dd"
                            minDate={new Date()}
                            placeholderText="Select a date"
                        />
                    </label>

                    <label>
                        Select Time:
                        <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </label>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <div className="admin-add-button-container">
                        <button onClick={handleAddAvailability}>Add Availability</button>
                    </div>
                </div>

                <h2>Available Dates and Hours</h2>
                {availableDates.length === 0 ? (
                    <p>No available dates or hours yet.</p>
                ) : (
                    <ul className="admin-available-list">
                        {availableDates.map((availability, index) => (
                            <li key={index}>
                                {availability.date} at {availability.time}
                                <button onClick={() => handleDeleteAvailability(availability._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="admin-appointments-section">
                <h2>Appointments</h2>
                {appointments.length === 0 ? (
                    <p>No appointments found.</p>
                ) : (
                    <ul className="admin-appointments-list">
                        {appointments.map((appointment) => (
                            <li key={appointment._id} onClick={() => handleAppointmentClick(appointment)}>
                                {appointment.appointmentTime} with {appointment.firstName} {appointment.lastName}
                                <button onClick={() => handleAppointmentDelete(appointment._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Λεπτομέρειες επιλεγμένης κράτησης */}
                {selectedAppointment && (
                    <div className="appointment-details">
                        <h3>Appointment Details</h3>
                        <p><strong>Name:</strong> {selectedAppointment.firstName} {selectedAppointment.lastName}</p>
                        <p><strong>Email:</strong> {selectedAppointment.email}</p>
                        <p><strong>Phone:</strong> {selectedAppointment.phone}</p>
                        <p><strong>Appointment Time:</strong> {selectedAppointment.appointmentTime}</p>
                        <p><strong>Birth Date:</strong> {selectedAppointment.birthDate}</p>
                        <p><strong>Birth Time:</strong> {selectedAppointment.birthTime}</p>
                        <p><strong>Birth Place:</strong> {selectedAppointment.birthPlace}</p>
                    </div>
                )}
            </div>

            {/* Φόρμα για αποστολή Newsletter */}
            <div className="newsletter-section">
                <h2>Send Newsletter</h2>
                <div className="newsletter-form1">
                    <label>
                        Subject:
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                        />
                    </label>

                    <label>
                        Message:
                        <textarea
                            value={newsletterMessage}
                            onChange={(e) => setNewsletterMessage(e.target.value)}
                            placeholder="Enter your message"
                        />
                    </label>

                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                    <button onClick={handleSendNewsletter}>Send Message</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
