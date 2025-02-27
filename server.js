require('dotenv').config();
const express = require('express');
const bodyParser= require('body-parser')
const mongoose =require('mongoose')
const app=express();
const authRoutes=require('./routes/auth')
const referralRoutes=require('./routes/referral')
const path = require('path');
const cors = require('cors');
app.use(cors({
    origin: 'http://127.0.0.1:3001',
    credentials: true
}));
app.use(bodyParser.json());
app.options('*', cors());
app.use(express.static(path.join(__dirname, 'public')));
  
//mongoose
mongoose.connect('mongodb://127.0.0.1:27017/referral-platform')
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
//Connecting routes
app.use('/api/auth',authRoutes);
app.use('/api/referral',referralRoutes);
const PORT=process.env.PORT;
app.listen(PORT,()=>{console.log(`your server is running on port ${PORT}`)});
