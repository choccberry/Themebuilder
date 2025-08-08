const express = require('express');
const router = express.Router();
const { Car, Vendor, Location, Category, Sequelize } = require('../models');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/cars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Create a new car listing
router.post('/', protect, restrictTo('vendor'), upload.array('images', 10), async (req, res) => {
    try {
        const { make, model, year, price, description, condition, categoryId, location, imageUrls } = req.body;
        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (!vendor) {
            return res.status(404).json({ error: 'Vendor profile not found' });
        }

        let images = [];
        if (req.files) {
            images = req.files.map(file => `/images/cars/${file.filename}`);
        }

        if (imageUrls) {
            const parsedImageUrls = JSON.parse(imageUrls);
            for (const url of parsedImageUrls) {
                const imageName = `${Date.now()}-${path.basename(url)}`;
                const imagePath = path.resolve(__dirname, `../../public/images/cars/${imageName}`);
                const response = await axios({ url, responseType: 'stream' });
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                images.push(`/images/cars/${imageName}`);
            }
        }

        const car = await Car.create({
            make,
            model,
            year,
            price,
            description,
            condition,
            categoryId,
            location,
            vendorId: vendor.id,
            images,
        });

        res.status(201).json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const { Op } = require('sequelize');

// Get all car listings with advanced search
router.get('/', async (req, res) => {
    try {
        const { categoryId, make, model, minPrice, maxPrice, condition, location, keyword, vendorId, year } = req.query;
        const where = {};

        if (categoryId) where.categoryId = categoryId;
        if (make) where.make = { [Op.iLike]: `%${make}%` };
        if (model) where.model = { [Op.iLike]: `%${model}%` };
        if (minPrice && maxPrice) where.price = { [Op.between]: [minPrice, maxPrice] };
        if (minPrice) where.price = { [Op.gte]: minPrice };
        if (maxPrice) where.price = { [Op.lte]: maxPrice };
        if (condition) where.condition = condition;
        if (location) where.location = { [Op.iLike]: `%${location}%` };
        if (vendorId) where.vendorId = vendorId;
        if (year) where.year = year;

        if (keyword) {
            where[Op.or] = [
                { make: { [Op.iLike]: `%${keyword}%` } },
                { model: { [Op.iLike]: `%${keyword}%` } },
                { description: { [Op.iLike]: `%${keyword}%` } },
            ];
        }

        const cars = await Car.findAll({
            where,
            include: [Vendor],
            order: [['featured', 'DESC'], ['createdAt', 'DESC']],
        });
        res.json(cars);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get meta data for search filters
router.get('/meta', async (req, res) => {
    try {
        const makes = await Car.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('make')), 'make']],
            order: [['make', 'ASC']],
        });
        const locations = await Location.findAll({ order: [['state', 'ASC'], ['city', 'ASC']] });
        const categories = await Category.findAll({ order: [['name', 'ASC']] });
        res.json({
            makes: makes.map(m => m.make),
            locations,
            categories,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a single car listing
router.get('/:id', async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id, { include: [Vendor] });
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a car listing
router.put('/:id', protect, restrictTo('vendor'), upload.array('images', 10), async (req, res) => {
    try {
        const { make, model, year, price, description, condition, categoryId, location, imageUrls } = req.body;
        const car = await Car.findByPk(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
        if (car.vendorId !== vendor.id) {
            return res.status(403).json({ error: 'You are not authorized to update this listing' });
        }

        let images = car.images || [];
        if (req.files) {
            images = images.concat(req.files.map(file => `/images/cars/${file.filename}`));
        }

        if (imageUrls) {
            const parsedImageUrls = JSON.parse(imageUrls);
            for (const url of parsedImageUrls) {
                const imageName = `${Date.now()}-${path.basename(url)}`;
                const imagePath = path.resolve(__dirname, `../../public/images/cars/${imageName}`);
                const response = await axios({ url, responseType: 'stream' });
                const writer = fs.createWriteStream(imagePath);
                response.data.pipe(writer);
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                images.push(`/images/cars/${imageName}`);
            }
        }

        await car.update({
            make,
            model,
            year,
            price,
            description,
            condition,
            categoryId,
            location,
            images,
        });

        res.json(car);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a car listing
router.delete('/:id', protect, restrictTo('vendor', 'admin'), async (req, res) => {
    try {
        const car = await Car.findByPk(req.params.id);
        if (!car) {
            return res.status(404).json({ error: 'Car not found' });
        }

        if (req.user.role === 'vendor') {
            const vendor = await Vendor.findOne({ where: { userId: req.user.id } });
            if (car.vendorId !== vendor.id) {
                return res.status(403).json({ error: 'You are not authorized to delete this listing' });
            }
        }

        await car.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
