const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

//Render halaman register
router.get('/register', (req, res) => {
    res.render('register');
});

//Proses register user
router.post('/register', (req, res) => {
    const { username, email, password, gender, phone, address } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = 'INSERT INTO users (username, email, password, gender, phone, address) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [username, email, hashedPassword, gender, phone, address], (err, result) => {
        if (err) throw err;
        res.redirect('/auth/login');
    });
});

//Render halaman login
router.get('/login', (req, res) => {
    res.render('login');
});

//Proses login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];

            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.redirect('/auth/profile');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('User not found');
        }
    });
});

//Render halaman profile user
router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/auth/login');
    }
});

// Render halaman edit profile
router.get('/profile/edit-profile', (req, res) => {
    if (req.session.user) {
        res.render('edit-profile', { user: req.session.user });
    } else {
        res.redirect('/auth/login');
    }
});

// Proses perubahan profile
router.post('/profile/edit-profile', (req, res) => {
    const { username, email, gender, phone, address } = req.body;
    const userId = req.session.user.id;

    const query = 'UPDATE users SET username = ?, email = ?, gender = ?, phone = ?, address = ? WHERE id = ?';
    db.query(query, [username, email, gender, phone, address, userId], (err, result) => {
        if (err) throw err;

        // Update session dengan data yang baru diubah
        req.session.user.username = username;
        req.session.user.email = email;
        req.session.user.gender = gender;
        req.session.user.phone = phone;
        req.session.user.address = address;

        if (result.affectedRows === 0) {
            res.send('User not found');
            return;
        }

        res.redirect('/auth/profile');
    });
});

//Proses Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;

