import fetch from 'node-fetch';
import fs from 'fs';

const inputFilePath = '/Users/hendri.tjipto/Desktop/Customer.travelnew.json';
const outputFilePath = '/Users/hendri.tjipto/Desktop/ProcessedCustomerTravel.json';

// Extract GPS coordinates from input JSON
const extractCoordinates = (geoString) => {
  const match = geoString.match(/geo:([-+]?\d+\.\d+),([-+]?\d+\.\d+)/);
  if (match) {
    return { lat: match[1], lon: match[2] };
  }
  throw new Error(`Invalid geoString format: ${geoString}`);
};

// Convert coordinates to country using OpenCage API
const convertCoordinatesToCountry = async (lat, lon) => {
  const apiKey = '98cd60241b274d3b99cd3964d7d27b6a';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.results && data.results.length > 0) {
    return data.results[0].components.country;
  }
  throw new Error(`Unable to convert coordinates to country: ${lat}, ${lon}`);
};

// Process input JSON file
const processJsonFile = async () => {
  const inputData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
  const processedData = await Promise.all(inputData.map(async (item) => {
    const startCoordinates = extractCoordinates(item.activity.start);
    const endCoordinates = extractCoordinates(item.activity.end);
    const startCountry = await convertCoordinatesToCountry(startCoordinates.lat, startCoordinates.lon);
    const endCountry = await convertCoordinatesToCountry(endCoordinates.lat, endCoordinates.lon);
    return {
      ...item,
      activity: {
        ...item.activity,
        startCountry,
        endCountry
      }
    };
  }));
  fs.writeFileSync(outputFilePath, JSON.stringify(processedData, null, 2));
};

processJsonFile().catch(error => console.error(error));