const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const ports = [3000, 3001, 3002, 3003];

// Middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', async (req, res) => {
    try {
        const cities = ['London', 'New York', 'Tokyo', 'Paris', 'Sydney'];
        const requests = cities.map(city => 
            axios.get(`https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`)
        );
        
        const responses = await Promise.all(requests);
        const weatherData = responses.map(response => response.data);
        
        res.render('index', { weatherData });
    } catch (error) {
        console.error('Error details:', error.response?.data || error.message);
        res.render('index', { weatherData: [] });
    }
});

app.get('/search', async (req, res) => {
    try {
        const city = req.query.city;
        
        if (!city || city.trim() === '') {
            return res.status(400).json({ error: 'Please enter a city name' });
        }

        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(city)}`
        );
        
        if (response.data) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'City not found' });
        }
    } catch (error) {
        console.error('Search error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        if (error.response?.data?.error?.code === 2008) {
            res.status(401).json({ error: 'Invalid API key. Please check your WeatherAPI key.' });
        } else if (error.response?.data?.error?.code === 1006) {
            res.status(404).json({ error: 'City not found. Please check the spelling and try again.' });
        } else {
            res.status(500).json({ 
                error: 'Error fetching weather data. Please try again.',
                details: error.response?.data?.error?.message || error.message
            });
        }
    }
});

// Try different ports
function startServer(ports) {
    const port = ports.shift();
    
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying next port...`);
            if (ports.length > 0) {
                startServer(ports);
            } else {
                console.error('No available ports found');
            }
        } else {
            console.error(err);
        }
    });
}

startServer([...ports]);