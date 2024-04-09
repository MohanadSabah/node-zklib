const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const zkEvents = require("./zkEvents");
const logger = require('./logger'); // Import the logger module
const auth = require("./auth/auth");
const apiRouter = require('./Router/apiRouter');
const cache = require("memory-cache");
const { log } = require("./helpers/errorLog");

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3002;

//api
// app.get('/api/attendances', auth, attendancesRoutes);
app.use('/api',apiRouter);
// app.get('/attendances',auth,async (req, res) => {
//   try {
//       await zkEvents.Connect();
//       connectionOpened = true; // Set flag if connection succeeds
//       const attendances = await zkEvents.getAttendances() ?? [];
//       await zkEvents.Disconnect();
//       res.json(attendances);
//   } catch (error) {
//       res.status(500).send('Failed to fetch attendance data');
//   }
// });// Register the routes
// Define the job that runs every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    var deviceInUse = cache.get("deviceInUse");
    if(deviceInUse==true){
      logger.info("Device in use");
      return;
    }
    await zkEvents.Connect();
    cache.put("deviceInUse", true); // Cache for 10 minutes
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
        cache.put("deviceInUse", false);
        zkEvents.Disconnect();
      });
      cache.put("deviceInUse", false);
      zkEvents.Disconnect();
  } catch (error) {
    logger.error('error in schedule CRON');
    logger.error(JSON.stringfy(error));
    await zkEvents.Disconnect();
    cache.put("deviceInUse", false);

  }
  cache.put("deviceInUse", false);
  await zkEvents.Disconnect();

});

// Start the Express app
app.listen(PORT, async () => {
  cache.put("deviceInUse", false);
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