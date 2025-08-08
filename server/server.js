const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

const dataPath = path.join(__dirname, 'data');
const carsFilePath = path.join(dataPath, 'cars.json');
const locationsFilePath = path.join(dataPath, 'locations.json');

app.get('/api/cars', (req, res) => {
    const cars = JSON.parse(fs.readFileSync(carsFilePath));
    res.json(cars);
});

app.listen(port, () => {
