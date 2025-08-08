const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { hashPassword, comparePassword, createToken } = require('../auth');

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = hashPassword(password);
        const user = await User.create({ email, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isPasswordValid = comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const token = createToken({ id: user.id, role: user.role });
        res.json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
