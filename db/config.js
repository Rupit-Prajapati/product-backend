const mongoose = require('mongoose');
require('dotenv').config();
const User = process.env.DB_USER
const Password = process.env.DB_PASSWORD
mongoose.connect(`mongodb+srv://${User}:${Password}@cluster0.i4fd07c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)