const express = require('express');
const router = express.Router();
const { User, Vendor, Car, Location, Category } = require('../models');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// All routes in this file are protected and restricted to admins
router.use(protect, restrictTo('admin'));

// User Management
router.get('/users', async (req, res) => {
    const users = await User.findAll();
    res.json(users);
});

router.put('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    await User.update({ role }, { where: { id: req.params.id } });
    res.json({ message: 'User role updated' });
});

// Vendor Management
router.get('/vendors', async (req, res) => {
    const vendors = await Vendor.findAll({ include: [User] });
    res.json(vendors);
});

router.put('/vendors/:id/approve', async (req, res) => {
    // This assumes a vendor application process where a vendor might have a 'pending' status
    // For now, we are just changing the user role.
    const vendor = await Vendor.findByPk(req.params.id);
    await User.update({ role: 'vendor' }, { where: { id: vendor.userId } });
    res.json({ message: 'Vendor approved' });
});

// Listing Management
router.delete('/cars/:id', async (req, res) => {
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    await car.destroy();
    res.status(204).send();
});

// Location Management
router.post('/locations', async (req, res) => {
    const { state, city } = req.body;
    const location = await Location.create({ state, city });
    res.status(201).json(location);
});

router.put('/locations/:id', async (req, res) => {
    const { state, city } = req.body;
    await Location.update({ state, city }, { where: { id: req.params.id } });
    res.json({ message: 'Location updated' });
});

router.delete('/locations/:id', async (req, res) => {
    await Location.destroy({ where: { id: req.params.id } });
    res.status(204).send();
});

// Category Management
router.post('/categories', async (req, res) => {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.status(201).json(category);
});

router.put('/categories/:id', async (req, res) => {
    const { name } = req.body;
    await Category.update({ name }, { where: { id: req.params.id } });
    res.json({ message: 'Category updated' });
});

router.delete('/categories/:id', async (req, res) => {
    await Category.destroy({ where: { id: req.params.id } });
    res.status(204).send();
});

// Ad Exchange Control
router.put('/cars/:id/feature', async (req, res) => {
    const { featured } = req.body;
    const car = await Car.findByPk(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    await car.update({ featured });
    res.json({ message: 'Car feature status updated' });
});

module.exports = router;
