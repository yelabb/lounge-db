const express = require('express');
const AirportCodes = require('@nwpr/airport-codes');
const fs = require('fs');
const path = require('path');
const app = express();

const port = 3000; 

// Initialize airport-codes
const airports = new AirportCodes();

// JSON request bodies
const airportDataFolder = './db';

// Middleware to parse JSON request bodies
app.use(express.json());

//// Helper function to read airport data from file
function getAirportData(iata) {
    return new Promise((resolve, reject) => {
      const filePath = path.join(airportDataFolder, `${iata}.json`);
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err); 
        } else {
          try {
            resolve(JSON.parse(data));
          } catch (parseError) {
            reject(parseError);
          }
        }
      });
    });
  }

  app.get('/api/:iata', async (req, res) => {
    try {
      const iata = req.params.iata.toUpperCase();
      const airportData = await getAirportData(iata); 
  
      // Find the airport details using airport-codes (updated)
     const airportInfo = airports.find(airport => airport.iata === iata);
  
      if (!airportInfo) {
        return res.status(404).json({ message: 'Airport not found in airport-codes data' });
      }
  
      res.json({
        cities: [airportInfo.city], // Since it's a single airport
        count: 1, 
        airports: [airportData] 
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({ message: 'Airport data not found' });
      } else {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching airport data' });
      }
    }
});

// Search by name (partial matching)
app.get('/api/name/:name', async (req, res) => {
    try {
      const searchName = req.params.name.toLowerCase(); 
      const matchingAirports = airports.filter(airport => {
        return airport.name.toLowerCase().includes(searchName);
      });
  
      const airportDataPromises = matchingAirports.map(airport => 
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);
  
      const cities = [...new Set(matchingAirports.map(airport => airport.city))];
  
      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching airport data' });
    }
  });
  
  // Search by country code
  app.get('/api/country/:country', async (req, res) => {
    try {
      const countryCode = req.params.country.toUpperCase();
      const matchingAirports = airports.filter(airport => {
        return airport.iso2 === countryCode; 
      });
  
      const airportDataPromises = matchingAirports.map(airport => 
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);
  
      const cities = [...new Set(matchingAirports.map(airport => airport.city))];
  
      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData
      }); 
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching airport data' });
    }
  });
  
  // Search by position (latitude/longitude)
  app.get('/api/position', async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon);
      const radius = parseFloat(req.query.radius) || 50; // Default radius 50km
  
      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ message: 'Invalid latitude or longitude' });
      }
  
      const matchingAirports = airports.nearby(lat, lon, radius);
  
      const airportDataPromises = matchingAirports.map(airport => 
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);
  
      const cities = [...new Set(matchingAirports.map(airport => airport.city))];
  
      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching airport data' });
    }
  });
  
  app.listen(port, () => {
    console.log(`Airport search API listening at http://localhost:${port}`);
  });