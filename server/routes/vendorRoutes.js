const express = require('express');
const router = express.Router();
const { Vendor, User } = require('../models');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Apply to become a vendor
router.post('/apply', protect, async (req, res) => {
    try {
        const { dealershipName, state, city, contactInfo } = req.body;
        const userId = req.user.id;

        // Check if user is already a vendor
        const existingVendor = await Vendor.findOne({ where: { userId } });
        if (existingVendor) {
            return res.status(400).json({ error: 'User is already a vendor' });
        }

        const vendor = await Vendor.create({
            dealershipName,
            state,
            city,
            contactInfo,
            userId,
        });

        // Update user role to 'vendor' - or this could be an admin action
        // For now, let's assume it's automatic on application
        await User.update({ role: 'vendor' }, { where: { id: userId } });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get vendor profile
router.get('/profile', protect, restrictTo('vendor'), async (req, res) => {
    try {
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor profile not found' });
        }
        res.json(vendor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update vendor profile
router.put('/profile', protect, restrictTo('vendor'), async (req, res) => {
    try {
        const { dealershipName, state, city, contactInfo, logo } = req.body;
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor profile not found' });
        }
        await vendor.update({ dealershipName, state, city, contactInfo, logo });
        res.json(vendor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all vendors
router.get('/', async (req, res) => {
    try {
        const vendors = await Vendor.findAll();
        res.json(vendors);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
