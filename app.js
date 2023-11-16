// app.js
const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const zkEvents = require("./zkEvents");
const logger = require('./logger'); // Import the logger module

const app = express();
const PORT = process.env.PORT || 3000;

// Define the job that runs every 10 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    var attendances = await zkEvents.getAttendances();
    let data = JSON.stringify({ data: attendances });

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://hrms-api-test.halasat.com/api/v1/multi-checkin-out",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic YWRtaW46YWRtaW4yMDIz",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        logger.info(JSON.stringify(response.data));
      })
      .catch((error) => {
        logger.error(error);
      });
  } catch (error) {
    logger.error('error in schedule CRON');
    logger.error(error);
  }
});

// Start the Express app
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  try {
    await zkEvents.Connect();
    logger.info("Connection successful");
    // var attendances = await zkEvents.getAttendances();
    // console.log(attendances);
  } catch (error) {
    console.error("Connection or attendance retrieval failed:", error);
  }
});
