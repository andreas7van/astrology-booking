const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);
};

hashPassword('admin123');  // Το 'admin123' είναι το κωδικό που θες να κρυπτογραφήσεις