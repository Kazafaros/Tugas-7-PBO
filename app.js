const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();

//Set EJS sebagai Template Engine
app.set('view engine', 'ejs');

//Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));


//Middlewares to check login status
app.use((req, res, next) => {
    if (!req.session.user && req.path != '/auth/login' && req.path != '/auth/register') {

// if the user is not logged in and trying to access any other page expect login / register
       return res.redirect('/auth/login');
    }
    next();
})

//Routes
app.use('/auth', authRoutes);

//Root Route: Redirect to / auth/login or auth/profile based on session 
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/auth/profile');
    } else {
        return res.redirect('/auth/login');
    }
});

//Menjalankan Server
app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});