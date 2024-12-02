[![Fly Deploy](https://github.com/yelabb/lounge-db/actions/workflows/fly-deploy.yml/badge.svg)](https://github.com/yelabb/lounge-db/actions/workflows/fly-deploy.yml)
# Airport Lounges Search API

This is a Node.js Express API that provides a simple search engine for airport Lounges information. Airport data is stored in json inside ```./db``` folder.

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
   yarn
   ```

## API Endpoints

- **`/api/:iata`:** Get detailed airport information from JSON file.
  - Example: `/api/LHR`
- **`/api/name/:name`:** Search by name (partial matching).
  - Example: `/api/name/london`
  - Example: `/api/name/trudeau`
- **`/api/country/:country`:** Search by country name
  - Example: `/api/country/canada`
- **`/api/position`:** Search by position (latitude/longitude).
  - Example: `/api/airports/position?lat=51.5074&lon=0.1278&radius=100`


## Scripts

- **`start`:**  Starts the Rest api server
- **`update:db`:**  update airport lounges json database

