# Χρησιμοποιούμε την έκδοση Node 16-alpine για μικρότερο μέγεθος image
FROM node:16-alpine

# Ορισμός του working directory
WORKDIR /app

# Αντιγραφή των αρχείων package.json και yarn.lock
COPY package.json yarn.lock ./

# Εγκατάσταση των εξαρτήσεων μέσω yarn
RUN yarn install

# Αντιγραφή όλων των αρχείων του project στο container
COPY . .

# Δημιουργία του React build
RUN yarn build

# Άνοιγμα του port 3000 για το React frontend και 8000 για το Node.js backend
EXPOSE 3000 3001

# Εκτέλεση του Node.js server
CMD ["node", "src/Server.js"]
