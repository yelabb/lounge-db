```markdown
# Airport Search API

This is a Node.js Express API that provides a simple search engine for airport information. It uses the `@nwpr/airport-codes` library for basic airport data and also allows you to store detailed airport information in separate JSON files.

## Features

- Search airports by:
    - **Name:** (partial matching)
    - **IATA code:**
    - **Country code:**
    - **Geographic position:** (latitude/longitude with radius)
- Retrieve detailed airport information from JSON files.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install express @nwpr/airport-codes
   ```

## Usage

1. **Create an `airport-data` folder:** Place your `airportCode.json` files (e.g., `LHR.json`, `JFK.json`) in this folder. Each file should contain detailed information for the corresponding airport.
2. **Start the server:**
   ```bash
   node airport-api.js 
   ```
   The API will be running at `http://localhost:3000`.

## API Endpoints

- **`/api/:iata`:** Get detailed airport information from JSON file.
  - Example: `/api/LHR`
- **`/api/name/:name`:** Search by name (partial matching).
  - Example: `/api/name/london`
  - Example: `/api/iata/LHR`
- **`/api/country/:country`:** Search by country code.
  - Example: `/api/country/US`
- **`/api/position`:** Search by position (latitude/longitude).
  - Example: `/api/airports/position?lat=51.5074&lon=0.1278&radius=100`


## Scripts

- **`start`:**  Starts the rest api server
- **`start:crawler`:**  update airport lounges data

