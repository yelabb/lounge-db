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
 * @returns {Promise<void>} A promise that resolves when the download and save operation is complete.
 */
const downloadAndSave = (url, skipExisting=true) => {
  return new Promise((resolve, reject) => {
    const airportId = path.basename(url, ".json");
    const filePath = path.join(__dirname, "db", `${airportId}.json`);

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
const downloadAllAirports = async () => {
  const dir = path.join(__dirname, "db");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  for (let i = 0; i < airportUrls.length; i++) {
    try {
      await downloadAndSave(airportUrls[i]);
      // Wait for 500ms before the next request to avoid overloading the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing ${airportUrls[i]}: ${error}`);
    }
  }
};


downloadAllAirports()
