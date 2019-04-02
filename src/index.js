import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import { inspect } from "util";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.listen(process.env.PORT);

const latLongURLGetter = (address, key) => {
  return `http://dev.virtualearth.net/REST/v1/Locations?q=${address}&key=${key}`;
};

const coordinatesGetter = obj => {
  return obj.data.resourceSets[0].resources[0].point.coordinates;
};

const resultsGetter = obj => {
  return obj.data.resourceSets[0].resources[0].results[0];
};
app.post("/bingit", async (req, res) => {
  const addressOrigin = req.body.addressOrigin;
  const addressDestination = req.body.addressDestination;

  try {
    const originLocationUrlForQuery = latLongURLGetter(
      req.body.addressOrigin,
      process.env.BING_MAPS_KEY
    );
    const locationDataFromQuery = await axios.get(originLocationUrlForQuery);
    console.log(coordinatesGetter(locationDataFromQuery));
    const [originLat, originLong] = coordinatesGetter(locationDataFromQuery);

    const origin = {
      latitude: originLat,
      longitude: originLong
    };

    const destinationLocationUrlForQuery = latLongURLGetter(
      req.body.addressDestination,
      process.env.BING_MAPS_KEY
    );
    const destinationLocationDataFromQuery = await axios.get(
      destinationLocationUrlForQuery
    );
    console.log(coordinatesGetter(destinationLocationDataFromQuery));
    const [destinationLat, destinationLong] = coordinatesGetter(
      destinationLocationDataFromQuery
    );
    const destination = {
      latitude: destinationLat,
      longitude: destinationLong
    };

    const distanceMatrixUrl = `https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=${
      origin.latitude
    },${origin.longitude}&destinations=${destination.latitude},${
      destination.longitude
    }&travelMode=driving&key=${process.env.BING_MAPS_KEY}`;

    const bingData = await axios.get(distanceMatrixUrl);

    console.log("bingData: ", resultsGetter(bingData));
    res.send(inspect(bingData));
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("hello root!");
});
