const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const zkEvents = require("./zkEvents");
const logger = require('./logger'); // Import the logger module
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3002;

// Define the job that runs every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
          await zkEvents.Connect();
    var attendances = await zkEvents.getAttendances();
    let data = JSON.stringify({ data: attendances });
          console.log(attendances.length);
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://127.0.0.1:88/api/v1/multi-checkin-out",
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
    logger.error(JSON.stringfy(error));
    await zkEvents.Disconnect();

  }
        await zkEvents.Disconnect();

});

// Start the Express app
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  //try {
   // await zkEvents.Connect();
   // logger.info("Connection successful");
    // var attendances = await zkEvents.getAttendances();
    // console.log(attendances);
 // } catch (error) {
   // console.error("Connection or attendance retrieval failed:", error);
  //}
});