require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const corsOptions = require('./config/corsOptions');
const { logger, logEvents } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.json());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// Routes 
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/auth'));
app.use('/mail', require('./routes/sendMail'));
app.use('/prop-mail', require('./routes/sendPropMail'));
app.use('/users', require('./routes/users'));
app.use('/rent', require('./routes/rentProps'));
app.use('/buy', require('./routes/buyProps'));

app.use('/*', (req, res) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: "404: Sorry, Page Not Found!"})
    } else if (req.accepts('txt')) {
        res.send("404: Sorry, Page Not Found!")
    }
})

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, console.log(`Server running on port: ${PORT}`));
});

mongoose.connection.on('error', err => {
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErr.log');
});