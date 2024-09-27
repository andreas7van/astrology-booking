import axios from 'axios';

const api = axios.create({
    baseURL: 'https://astrology-booking-1.onrender.com', // Το URL του backend
    withCredentials: true, // Αν χρησιμοποιείς cookies ή authentication headers
});

export default api;
