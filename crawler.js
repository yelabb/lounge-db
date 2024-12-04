import fs from "fs";
import path from "path";
import https from "https";
import { fileURLToPath } from "url";
import { airports } from "@nwpr/airport-codes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iataCodes = airports.map((airport) => airport.iata);
const airportUrls = iataCodes.map(
  (iata) => `https://next.loungebuddy.com/api/airport/${iata}`
);

/**
 * Downloads a file from a given URL and saves it to the specified path.
 *
 * @param {string} url - The URL of the file to download.
 * @param {string} [outPath='db/iata'] - The output path for the downloaded file. Defaults to 'db/iata'.
 * @param {boolean} [skipExisting=true] - Whether to skip downloading if the file already exists. Defaults to true.
 * @returns {Promise<void>} A promise that resolves when the download and save operation is complete.
 */
const downloadAndSave = (url, outPath = "db/iata", skipExisting = true) => {
  return new Promise((resolve, reject) => {
    const airportId = path.basename(url, ".json");
    const filePath = path.join(__dirname, outPath, `${airportId}.json`);

    // Check if the file already exists
    if (fs.existsSync(filePath) && skipExisting) {
      console.log(`Skipping download: ${airportId}.json already exists`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filePath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          console.log(`Downloaded and saved: ${airportId}.json`);
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filePath);
        console.error(`Error downloading ${url}: ${err}`);
        reject(err);
      });
  });
};

/**
 * Downloads JSON data for all airports from LoungeBuddy API and saves each airport data to a separate file.
 *
 * @returns {Promise<void>} A promise that resolves when all downloads are complete.
 */
export const downloadAllAirports = async () => {
  const dir = path.join(__dirname, "db/iata");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (let i = 0; i < airportUrls.length; i++) {
    try {
      await downloadAndSave(airportUrls[i], "db/iata");
      // Wait for 500ms before the next request to avoid overloading the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing ${airportUrls[i]}: ${error}`);
    }
  }
};

/**
 * Retrieves all lounge IDs from the downloaded airport data.
 *
 * @param {string} folderPath - The path to the folder containing the airport data files.
 * @returns {string[]} An array of lounge IDs.
 */
function getAllLoungesIds(folderPath) {
  const loungesIds = [];

  // Read all files in the folder
  const files = fs.readdirSync(folderPath);

  files.forEach((file) => {
    // Construct the full file path
    const filePath = path.join(folderPath, file);

    // Check if it's a JSON file
    if (path.extname(file) === ".json") {
      try {
        // Read the JSON data from the file
        const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        // Extract loungesIds from the lounges array
        if (jsonData.lounges && Array.isArray(jsonData.lounges)) {
          jsonData.lounges.forEach((lounge) => {
            if (lounge.id) {
              loungesIds.push(
                `https://next.loungebuddy.com/api/lounge/${lounge.id}`
              );
            }
          });
        }
      } catch (error) {
        console.error(`Error reading or parsing ${filePath}:`, error);
      }
    }
  });

  return loungesIds;
}

/**
 * Downloads JSON data for all lounges from LoungeBuddy API and saves each lounge data to a separate file.
 *
 * @returns {Promise<void>} A promise that resolves when all downloads are complete.
 */
export const downloadAllLounges = async () => {
  const loungesIds = getAllLoungesIds("./db/iata");

  const dir = path.join(__dirname, "db/lounges");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (let i = 0; i < loungesIds.length; i++) {
    try {
      await downloadAndSave(loungesIds[i], "db/lounges");
      // Wait for 500ms before the next request to avoid overloading the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error processing ${loungesIds[i]}: ${error}`);
    }
  }
};

// Make downloadAllLounges and downloadAllAirports runnable using command line
if (process.argv[2] === "downloadAllAirports") {
  downloadAllAirports();
} else if (process.argv[2] === "downloadAllLounges") {
  downloadAllLounges();
}