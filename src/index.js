import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import axios from "axios";
import { inspect } from "util";
import fetch from "node-fetch";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.listen(process.env.PORT);

const latLongURLGetter = (address, key) => {
  return `http://dev.virtualearth.net/REST/v1/Locations?q=${address}&key=${key}`;
};

const coordinatesGetter = obj => {
  return obj.resourceSets[0].resources[0].point.coordinates;
};

const resultsGetter = obj => {
  return obj.resourceSets[0].resources[0].results[0];
};
app.post("/bingit", async (req, res) => {
  const addressOrigin = req.body.addressOrigin;
  const addressDestination = req.body.addressDestination;

  try {
    const originLocationUrlForQuery = latLongURLGetter(
      req.body.addressOrigin,
      process.env.BING_MAPS_KEY
    );
    const locationDataFromQuery = await fetch(originLocationUrlForQuery);
    const locationResponse = await locationDataFromQuery.json();
    const [originLat, originLong] = coordinatesGetter(locationResponse);

    const origin = {
      latitude: originLat,
      longitude: originLong
    };
    console.log("origin: ", origin);

    const destinationLocationUrlForQuery = latLongURLGetter(
      req.body.addressDestination,
      process.env.BING_MAPS_KEY
    );
    const destinationLocationDataFromQuery = await fetch(
      destinationLocationUrlForQuery
    );
    const destinationResponse = await destinationLocationDataFromQuery.json();
    const [destinationLat, destinationLong] = coordinatesGetter(
      destinationResponse
    );
    const destination = {
      latitude: destinationLat,
      longitude: destinationLong
    };

    console.log("destination: ", destination);

    const distanceMatrixUrl = `https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=${
      origin.latitude
    },${origin.longitude}&destinations=${destination.latitude},${
      destination.longitude
    }&travelMode=driving&key=${process.env.BING_MAPS_KEY}`;

    const bingData = await fetch(distanceMatrixUrl);
    const bingResponse = await bingData.json();
    console.log("bingResponse: ", resultsGetter(bingResponse));
    const { travelDistance, travelDuration } = resultsGetter(bingResponse);
    console.log("travelDistance: ", travelDistance);
    console.log("travelDuration: ", travelDuration);
    res.send(
      `distance: ${travelDistance} miles, duration: ${travelDuration} min`
    );
  } catch (e) {
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("hello root!");
});
