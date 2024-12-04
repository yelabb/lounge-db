import express from "express";
import cors from "cors";
import NodeCache from "node-cache";
import compression from "compression";
import { airports } from "@nwpr/airport-codes";
import fs from "fs";
import path from "path";
import { getDistance } from "geolib";
import helmet from "helmet";
import { query, param, validationResult } from "express-validator";

const app = express();
const port = 3000;

// JSON request bodies
const airportDataFolder = "./db";

// Internal cache for 1 hour
const airportCache = new NodeCache({ stdTTL: 60 * 60 });

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(helmet()); // Set security headers

// Helper function to read airport data from file (using promises)
const getAirportData = async (iata) => {
  if (!iata) {
    return;
  }
  const cachedData = airportCache.get(iata);
  if (cachedData) {
    return cachedData;
  }

  const filePath = path.join(airportDataFolder, `${iata}.json`);
  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const airportData = JSON.parse(data);
    if (iata) {
      airportCache.set(iata, airportData);
    }
    return airportData;
  } catch (err) {
    return null;
  }
};

// Search by name (partial matching)
app.get(
  "/api/name/:name",
  param("name").isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const searchName = req.params.name.toLowerCase();
      const matchingAirports = airports.filter((airport) =>
        airport.name.toLowerCase().includes(searchName)
      );

      const airportDataPromises = matchingAirports.map((airport) =>
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);

      const cities = [
        ...new Set(matchingAirports.map((airport) => airport.city)),
      ];

      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData.filter(d=>d),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching airport data" });
    }
  }
);

// Search by country code
app.get(
  "/api/country/:country",
  param("country").isString().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const countryName = req.params.country.toLowerCase();
      const matchingAirports = airports.filter(
        (airport) => airport.country.toLowerCase() === countryName
      );

      const airportDataPromises = matchingAirports.map((airport) =>
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);

      const cities = [
        ...new Set(matchingAirports.map((airport) => airport.city)),
      ];

      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData.filter((d) => d),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching airport data" });
    }
  }
);

// Search by position (latitude/longitude)
app.get(
  "/api/position",
  query("lat").isFloat(),
  query("lon").isFloat(),
  query("radius").optional().isFloat({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const lat = parseFloat(req.query.lat);
      const lon = parseFloat(req.query.lon);
      const radius = parseFloat(req.query.radius) || 50; // Default radius 50km

      const matchingAirports = airports.filter((airport) => {
        const distance = getDistance(
          { latitude: lat, longitude: lon },
          { latitude: airport.latitude, longitude: airport.longitude }
        );
        return distance <= radius * 1000; // Convert radius to meters
      });

      const airportDataPromises = matchingAirports.map((airport) =>
        getAirportData(airport.iata)
      );
      const airportData = await Promise.all(airportDataPromises);

      const cities = [
        ...new Set(matchingAirports.map((airport) => airport.city)),
      ];

      res.json({
        cities: cities,
        count: matchingAirports.length,
        airports: airportData.filter((d) => d),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching airport data" });
    }
  }
);

// Get airport by IATA code
app.get(
  ["/api/:iata", "/api/iata/:iata"],
  param("iata").isString().isLength({ min: 3, max: 3 }).toUpperCase(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const iata = req.params.iata;
      const airportData = await getAirportData(iata);

      const airportInfo = airports.find((airport) => airport.iata === iata);
      if (!airportInfo) {
        return res
          .status(404)
          .json({ message: "Airport not found in airport-codes data" });
      }

      res.json({
        cities: [airportInfo.city],
        count: 1,
        airports: airportData ? [airportData] : null,
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.status(404).json({ message: "Airport data not found" });
      } else {
        console.error(error);
        return res.status(500).json({ message: "Error fetching airport data" });
      }
    }
  }
);

app.listen(port, () => {
  console.log(`Airport search API listening at http://localhost:${port}`);
});
