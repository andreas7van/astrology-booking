require('dotenv').config()
const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);  // Χρησιμοποίησε την env μεταβλητή
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;  // Ισχυρό μυστικό κλειδί για το JWT


app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)  // Χρησιμοποίησε την env μεταβλητή
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.log('MongoDB connection error:', err));


    const appointmentSchema = new mongoose.Schema({
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        appointmentDate: { type: String, required: true }, // Προσθήκη του πεδίου appointmentDate
        appointmentTime: { type: String, required: true },
        birthDate: { type: String },
        birthTime: { type: String },
        birthPlace: { type: String },
    });
    

const Appointment = mongoose.model('Appointment', appointmentSchema);

const availabilitySchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    isBooked: { type: Boolean, default: false }, // Προσθέτουμε πεδίο για να ξέρουμε αν έχει κρατηθεί
});

const Availability = mongoose.model('Availability', availabilitySchema);




// Μοντέλο για τους συνδρομητές του newsletter
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    dateSubscribed: { type: Date, default: Date.now },
});
const Subscriber = mongoose.model('Subscriber', subscriberSchema);



// ContactMessage Schema
const contactMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    dateSent: { type: Date, default: Date.now },
});

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);


const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true }, // Βεβαιώσου ότι το πεδίο email υπάρχει
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
});

const Admin = mongoose.model('Admin', adminSchema);


/*
// Χαρτογραφημένα credentials διαχειριστή (κρυπτογραφημένος κωδικός)
const admin = {
    username: 'admin',
    passwordHash: '$2b$10$/lZVi5AfOkrV1gLRn2TKR.sDd6fN6RE.10LKR.XKO3DJcfmZnexXW' // Κρυπτογραφημένος κωδικός για 'admin123'
};
*/


// Συνάρτηση για τη δημιουργία JWT
const generateToken = (username) => {
    return jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
};




const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Received token:', token);  // Εκτύπωση του token για έλεγχο

    if (!token) {
        return res.status(401).json({ message: 'Απαιτείται έλεγχος ταυτότητας' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Μη έγκυρο ή ληγμένο token' });
        }
        req.user = user;
        next();
    });
};


app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('Received login request:', { username, password });  // Εκτύπωση των εισερχόμενων δεδομένων

        const admin = await Admin.findOne({ username });
        console.log('Admin found in database:', admin);  // Εκτύπωση του admin που βρέθηκε στη βάση

        if (!admin) {
            console.log('Admin not found with username:', username);  // Log αν ο admin δεν βρέθηκε
            return res.status(401).json({ message: 'Λάθος όνομα χρήστη ή κωδικός' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
        console.log('Password match:', passwordMatch);  // Εκτύπωση για να δεις αν το password ταιριάζει

        if (!passwordMatch) {
            console.log('Password mismatch for user:', username);  // Log αν ο κωδικός δεν ταιριάζει
            return res.status(401).json({ message: 'Λάθος όνομα χρήστη ή κωδικός' });
        }

        const token = generateToken(username);
        console.log('Generated JWT token:', token);  // Εκτύπωση του δημιουργημένου token

        res.json({ token, message: 'Επιτυχής σύνδεση' });
    } catch (error) {
        console.error('Error during admin login:', error);  // Log για τυχόν σφάλματα
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});


app.get('/admin/test-token', authenticateToken, (req, res) => {
    res.json({ message: 'Το token είναι έγκυρο!', user: req.user });
});


// Ρυθμίσεις για Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Χρησιμοποίησε την env μεταβλητή
        pass: process.env.EMAIL_PASS   // Χρησιμοποίησε την env μεταβλητή
    }
});



// Προστατευμένο route για προσθήκη διαθεσιμότητας
app.post('/admin/availability', authenticateToken, async (req, res) => {
    const { date, time } = req.body;

    if (!date || !time) {
        return res.status(400).json({ message: 'Όλα τα πεδία είναι υποχρεωτικά!' });
    }

    try {
        const newAvailability = new Availability({ date, time });
        await newAvailability.save();
        res.json({ message: 'Η διαθεσιμότητα προστέθηκε επιτυχώς', availability: newAvailability });
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});


// Route για λήψη της λίστας με τις διαθέσιμες ώρες
app.get('/availability', async (req, res) => {
    try {
        const availabilities = await Availability.find();
        res.json(availabilities);
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});

app.post('/bookappointment', async (req, res) => {
    const { firstName, lastName, email, phone, appointmentDate, appointmentTime, birthDate, birthTime, birthPlace } = req.body;

    if (!firstName || !lastName || !email || !phone || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ message: 'Όλα τα πεδία είναι υποχρεωτικά!' });
    }

    try {
        // Έλεγχος αν υπάρχει ήδη κράτηση για την ίδια ώρα και ημερομηνία
        const existingAppointment = await Appointment.findOne({ appointmentDate, appointmentTime });
        if (existingAppointment) {
            return res.status(400).json({ message: 'Η συγκεκριμένη ημερομηνία και ώρα είναι ήδη κρατημένη.' });
        }

        // Έλεγχος αν η διαθεσιμότητα είναι ήδη κρατημένη
        const availability = await Availability.findOne({ date: appointmentDate, time: appointmentTime });

        if (!availability) {
            return res.status(400).json({ message: 'Δεν βρέθηκε διαθεσιμότητα για την επιλεγμένη ημερομηνία και ώρα.' });
        }

        if (availability.isBooked) {
            return res.status(400).json({ message: 'Η συγκεκριμένη διαθεσιμότητα είναι ήδη κρατημένη.' });
        }

        // Δημιουργία ραντεβού
        const newAppointment = new Appointment({
            firstName,
            lastName,
            email,
            phone,
            appointmentDate,  // Προσθήκη του πεδίου appointmentDate
            appointmentTime,
            birthDate,
            birthTime,
            birthPlace,
        });

        await newAppointment.save();

        // Ενημέρωση της διαθεσιμότητας ως κρατημένη
        availability.isBooked = true;
        await availability.save();

        console.log('Availability updated to booked:', availability); // Log για επιβεβαίωση

        res.json({ message: 'Το ραντεβού καταχωρήθηκε επιτυχώς', appointment: newAppointment });
    } catch (error) {
        console.error('Error during booking:', error); // Log για έλεγχο
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});






// Προστατευμένο route για να πάρει ο διαχειριστής τη λίστα με τα κλεισμένα ραντεβού
app.get('/admin/appointments', authenticateToken, async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});




app.post('/create-payment-intent', async (req, res) => {
    const { paymentMethodId, amount, appointmentDetails } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Το ποσό σε cents
            currency: 'eur', // Νόμισμα
            payment_method: paymentMethodId,
            confirm: true, // Αυτόματη επιβεβαίωση της πληρωμής
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never' // Αποτροπή των redirects
            }
        });

        if (paymentIntent.status === 'succeeded') {
            // Στείλε το email επιβεβαίωσης μετά την επιτυχή πληρωμή
            const mailResponse = await transporter.sendMail({
                from: '"Astrology Booking App" <partouzanfc2022@gmail.com>',
                to: appointmentDetails.email,
                subject: 'Επιβεβαίωση Ραντεβού',
                html: `
                    <h1>Επιβεβαίωση Ραντεβού</h1>
                    <p><strong>Όνομα:</strong> ${appointmentDetails.firstName} ${appointmentDetails.lastName}</p>
                    <p><strong>Ώρα Ραντεβού:</strong> ${appointmentDetails.appointmentTime}</p>
                    <p><strong>Ημερομηνία Γέννησης:</strong> ${appointmentDetails.birthDate}</p>
                    <p><strong>Τόπος Γέννησης:</strong> ${appointmentDetails.birthPlace}</p>
                `
            });

            res.json({ paymentIntent, mailResponse });
        } else {
            res.status(400).json({ error: 'Unexpected payment status' });
        }
    } catch (error) {
        console.error('Error creating PaymentIntent:', error);
        res.status(500).json({ error: error.message });
    }
});








// Route για διαγραφή ραντεβού και ενημέρωση διαθεσιμότητας
app.delete('/admin/appointments/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const appointment = await Appointment.findByIdAndDelete(id);

        if (!appointment) {
            return res.status(404).json({ message: 'Το ραντεβού δεν βρέθηκε' });
        }

        // Ενημέρωση της διαθεσιμότητας ως ελεύθερη
        const availability = await Availability.findOne({
            date: appointment.appointmentDate,
            time: appointment.appointmentTime,
        });

        if (!availability) {
            return res.status(404).json({ message: 'Η διαθεσιμότητα δεν βρέθηκε.' });
        }

        availability.isBooked = false;
        await availability.save();

        res.json({ message: 'Το ραντεβού διαγράφηκε επιτυχώς και η διαθεσιμότητα απελευθερώθηκε.' });
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή του ραντεβού' });
    }
});







// Route για εγγραφή στο newsletter
app.post('/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Το email είναι υποχρεωτικό!' });
    }

    try {
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();
        res.json({ message: 'Η εγγραφή στο newsletter ήταν επιτυχής!' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Το email είναι ήδη εγγεγραμμένο στο newsletter.' });
        } else {
            res.status(500).json({ message: 'Σφάλμα διακομιστή' });
        }
    }
});

// Λήψη λίστας συνδρομητών του newsletter
app.get('/admin/subscribers', async (req, res) => {
    try {
        const subscribers = await Subscriber.find();
        res.json(subscribers);
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});



// Route για αποστολή email σε όλους τους συνδρομητές
app.post('/admin/send-newsletter', async (req, res) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ message: 'Το θέμα και το μήνυμα είναι υποχρεωτικά!' });
    }

    try {
        // Λήψη όλων των συνδρομητών
        const subscribers = await Subscriber.find();

        if (subscribers.length === 0) {
            return res.status(400).json({ message: 'Δεν υπάρχουν συνδρομητές για αποστολή μηνύματος.' });
        }

        // Προετοιμασία και αποστολή email σε όλους τους συνδρομητές
        const emailPromises = subscribers.map(subscriber => {
            return transporter.sendMail({
                from: '"Astrology Newsletter" <partouzanfc2022@gmail.com>',
                to: subscriber.email,
                subject: subject,
                text: message,
                html: `<p>${message}</p>`, // Προαιρετική υποστήριξη για HTML
            });
        });

        await Promise.all(emailPromises);

        res.json({ message: 'Το newsletter στάλθηκε επιτυχώς σε όλους τους συνδρομητές!' });
    } catch (error) {
        console.error('Error sending newsletter:', error);
        res.status(500).json({ message: 'Σφάλμα κατά την αποστολή του newsletter' });
    }
});



// Route for handling "Contact Us" submissions
app.post('/contact-us', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Όλα τα πεδία είναι υποχρεωτικά!' });
    }

    try {
        // Save the message in the database
        const newMessage = new ContactMessage({ name, email, message });
        await newMessage.save();

        // Send email notification to admin
        const mailOptions = {
            from: '"Astrology Booking App" <partouzanfc2022@gmail.com>',
            to: 'admin@example.com', // Replace with admin email
            subject: 'Νέο μήνυμα από τη φόρμα επικοινωνίας',
            html: `
                <h1>Νέο μήνυμα από τη φόρμα επικοινωνίας</h1>
                <p><strong>Όνομα:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Μήνυμα:</strong> ${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Το μήνυμά σας στάλθηκε με επιτυχία!' });
    } catch (error) {
        console.error('Error handling contact message:', error);
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});



// Route for admin to view all contact messages
app.get('/admin/contact-messages', async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ dateSent: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Σφάλμα διακομιστή' });
    }
});




// Route for requesting password reset
app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        // Find the admin by email
        const admin = await Admin.findOne({ email });
        
        console.log(admin); // Προσθήκη για έλεγχο
        console.log('Sending email to:', admin.email);  // Εξασφάλισε ότι το email είναι σωστό
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Set reset token and expiry time (e.g., 1 hour)
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

        // Save the admin with the reset token
        await admin.save();
        

        // Send password reset email
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Frontend URL
        const mailOptions = {
            from: '"Astrology Booking App" <partouzanfc2022@gmail.com>',
            to: admin.email, // Δες αν το admin.email είναι ορατό
            subject: 'Password Reset Request',
            html: `
                <h1>Password Reset Request</h1>
                <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Password reset link sent to your email!' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Route to handle password reset
app.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Find the admin by reset token and check if the token is still valid
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Ensure token hasn't expired
        });

        if (!admin) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update admin's password and remove reset token and expiry
        admin.passwordHash = hashedPassword;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        // Save the updated admin
        await admin.save();

        res.json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.delete('/admin/availability/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const availability = await Availability.findByIdAndDelete(id);

        if (!availability) {
            return res.status(404).json({ message: 'Η διαθεσιμότητα δεν βρέθηκε' });
        }

        res.json({ message: 'Η διαθεσιμότητα διαγράφηκε επιτυχώς' });
    } catch (error) {
        console.error('Error deleting availability:', error); // Προσθήκη log για έλεγχο
        res.status(500).json({ message: 'Σφάλμα κατά τη διαγραφή της διαθεσιμότητας' });
    }
});


const PORT = process.env.PORT || 3001;  // Χρησιμοποίησε την περιβαλλοντική μεταβλητή PORT ή προεπιλογή την 3001

app.listen(PORT, () => {
    console.log(`Ο διακομιστής τρέχει στη θύρα ${PORT}`);
});
