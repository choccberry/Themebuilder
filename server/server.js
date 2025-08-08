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
    const carsData = JSON.parse(fs.readFileSync(carsFilePath, 'utf8'));
    res.json(carsData);
});

app.get('/api/locations', (req, res) => {
    const locationsData = JSON.parse(fs.readFileSync(locationsFilePath, 'utf8'));
    res.json(locationsData);
});

app.get('/api/cars/makes', (req, res) => {
    const carsData = JSON.parse(fs.readFileSync(carsFilePath, 'utf8'));
    res.json(carsData);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
