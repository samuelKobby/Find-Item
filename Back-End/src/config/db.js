const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {

mongoose.connect('mongodb+srv://findcard18:F5vToTGTXai9YaAW@findcarddb.1cuek.mongodb.net/?retryWrites=true&w=majority&appName=FindCardDB', {
   
})
.then(() => console.log('Find Card MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

};


module.exports = connectDB;
