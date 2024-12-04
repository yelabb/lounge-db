[![Fly Deploy](https://github.com/yelabb/lounge-db/actions/workflows/fly-deploy.yml/badge.svg)](https://github.com/yelabb/lounge-db/actions/workflows/fly-deploy.yml)
# Airport Lounges Search API

This is a Node.js Express API that provides a simple search engine for airport lounge information. Airport data is stored in JSON format inside the `./db` folder.

## Features

- Search airports by:
    - **Name:** (partial matching)
    - **IATA code:**
    - **Country code:**
    - **Geographic position:** (latitude/longitude with radius)
- Retrieve detailed airport information, including lounges, from JSON files.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   yarn
   ```

## Scripts

- **`yarn start`:** Starts the REST API server.
- **`yarn update:airports`:** Updates the airport database.
- **`yarn update:lounges`:** Updates the lounges database.

## API Endpoints

### Routes

- **`/api/airport/iata/:iata`:** Get detailed airport information from JSON file.
  - Example: `/api/airport/iata/LHR` 
- **`/api/airport/name/:name`:** Search by name (partial matching is supported).
  - Example: `/api/airport/name/london`
- **`/api/airport/country/:country`:** Search by country name.
  - Example: `/api/airport/country/canada`
- **`/api/airport/position`:** Search by position (latitude/longitude).
  - Example: `/api/airport/position?lat=51.5074&lon=0.1278&radius=100`
- **`/api/lounge/:loungeId`:** Search by lounge ID.
  - Example: `/api/lounge/lMsHJWj54i`


### Response Example (for `/api/airport/iata/YUL`)

```json
{
  "cities": [
    "Montreal"
  ],
  "count": 1,
  "airports": [
    {
      "airport": {
        "id": "rMZQ4nUwot",
        "IATA": "YUL",
        // ... other airport details
      },
      "meta": { 
        // ... metadata
      },
      "lounges": [
        {
          "id": "lMsHJWj54i",
          "name": "Air Canada Maple Leaf Lounge",
          // ... other lounge details
        },
        // ... more lounges
      ]
    }
  ]
}
```