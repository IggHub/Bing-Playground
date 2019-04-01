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

app.get("/bingit", async (req, res) => {
  try {
    const origin = {
      latitude: '47.6044',
      longitude: '-122.3345'
    };
    const destination = {
      latitude: '45.5347',
      longitude: '-122.6131'
    };
    const url = `https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&travelMode=driving&key=${
      process.env.BING_MAPS_KEY
    }`;
    const bingData = await axios.get(url);

    res.send(inspect( bingData ));
  } catch (e) {
    console.log("error: ", e);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("hello root!");
});
