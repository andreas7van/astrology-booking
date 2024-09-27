import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../themes/AppointmentForm.css';

function AppointmentForm({ onFormSubmit }) {
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appointmentDate: null,
        appointmentTime: '',
        birthDate: null,
        birthTime: '',
        birthPlace: '',
    });

    const [availableTimes, setAvailableTimes] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setTimeout(() => {
            setIsVisible(true);
        }, 100);
    }, []);

    // Fetch available times from the backend
    useEffect(() => {
        fetch('http://localhost:3001/availability')
            .then((response) => response.json())
            .then((data) => {
                // Φιλτράρουμε τις διαθέσιμες ώρες που δεν είναι κρατημένες
                setAvailableTimes(data.filter(item => !item.isBooked));
            })
            .catch((error) => {
                console.error('Error fetching availability:', error);
            });
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleDateChange = (date, name) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: date,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = {};

        if (!formData.email.includes('@')) {
            validationErrors.email = t('email_error');
        }
        if (!/^\d+$/.test(formData.phone) || formData.phone.length < 10) {
            validationErrors.phone = t('phone_error');
        }

        if (Object.keys(validationErrors).length > 0) {
            console.error('Validation Errors:', validationErrors);
            return;
        }

        const formattedAppointmentDate = formData.appointmentDate
            ? format(formData.appointmentDate, 'yyyy-MM-dd')
            : null;

        const formattedBirthDate = formData.birthDate
            ? format(formData.birthDate, 'dd/MM/yyyy')
            : null;

        const appointmentData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            appointmentDate: formattedAppointmentDate,
            appointmentTime: formData.appointmentTime,
            birthDate: formattedBirthDate,
            birthTime: formData.birthTime,
            birthPlace: formData.birthPlace,
        };

        try {
            const response = await fetch('http://localhost:3001/bookappointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Appointment booked successfully:', result);
                onFormSubmit(appointmentData); // Στέλνουμε τα δεδομένα ραντεβού στο App
                navigate('/payment'); // Ανακατεύθυνση στη σελίδα πληρωμής
            } else {
                console.error('Error booking appointment:', result.message);
            }
        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    };

    return (
        <form className={`appointment-form ${isVisible ? 'fade-in' : 'fade-out'}`} onSubmit={handleSubmit}>
            <h2>{t('book_appointment')}</h2>

            <div className="form-group">
                <label>
                    {t('first_name')} <span className="required">*</span>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder={t('first_name')}
                        required
                    />
                </label>

                <label>
                    {t('last_name')} <span className="required">*</span>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder={t('last_name')}
                        required
                    />
                </label>
            </div>

            <div className="form-group">
                <label>
                    {t('email')} <span className="required">*</span>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder={t('email')}
                        required
                    />
                </label>

                <label>
                    {t('phone')} <span className="required">*</span>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('phone')}
                        required
                    />
                </label>
            </div>

            <div className="form-group">
                <label>
                    {t('birth_date')} <span className="required">*</span>
                    <DatePicker
                        selected={formData.birthDate}
                        onChange={(date) => handleDateChange(date, 'birthDate')}
                        minDate={new Date(1900, 0, 1)}
                        maxDate={new Date()}
                        dateFormat="MM/dd/yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                        placeholderText={t('birth_date')}
                        required
                    />
                </label>

                <label>
                    {t('birth_time')}
                    <input
                        type="time"
                        name="birthTime"
                        className="form-time"
                        value={formData.birthTime}
                        onChange={handleInputChange}
                        placeholder={t('birth_time')}
                    />
                </label>
            </div>

            <div className="form-group">
                <label>
                    {t('birth_place')} <span className="required">*</span>
                    <input
                        type="text"
                        name="birthPlace"
                        value={formData.birthPlace}
                        onChange={handleInputChange}
                        placeholder={t('birth_place')}
                        required
                    />
                </label>
            </div>

            <div className="form-group">
                <label>
                    {t('appointment_date')} <span className="required">*</span>
                    <DatePicker
                        selected={formData.appointmentDate}
                        onChange={(date) => handleDateChange(date, 'appointmentDate')}
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                        dayClassName={(date) => {
                            const formattedDate = format(date, 'yyyy-MM-dd');
                            return availableTimes.some(item => item.date === formattedDate)
                                ? 'available-date'
                                : 'unavailable-date';
                        }}
                        placeholderText={t('appointment_date')}
                        required
                    />
                </label>

                <label>
                    {t('appointment_time')} <span className="required">*</span>
                    <select
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">{t('select_time')}</option>
                        {formData.appointmentDate && availableTimes
                            .filter(item => {
                                const formattedDate = format(new Date(formData.appointmentDate), 'yyyy-MM-dd');
                                return item.date === formattedDate;
                            })
                            .map((item, index) => (
                                <option key={index} value={item.time}>
                                    {item.time}
                                </option>
                            ))}
                    </select>
                </label>
            </div>

            <div id="button-wrapper">
                <button className="submit" type="submit">
                    {t('submit_button')}
                </button>
            </div>

            <p className="required-field-note">{t('required_field')}</p>
        </form>
    );
}

export default AppointmentForm;
