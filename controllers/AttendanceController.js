// Assuming zkEvents is a module for managing attendance-related operations
const zkEvents = require('../zkEvents');
const axios = require("axios");
const logger = require('../logger');
const cache = require("memory-cache");

const AttendanceController = {
    async fetchAttendances(req, res) {
        let connectionOpened = false;

        try {
            const date_filter = req.query.date_filter;
            const recently_record = req.query.recently_record;

            await zkEvents.Connect();
            connectionOpened = true;

            const attendances = await zkEvents.AttendancesFiltered(date_filter, recently_record) ?? [];

            // Disconnect before sending the response
            await zkEvents.Disconnect();
            connectionOpened = false; // Update flag as connection is closed

            return res.json(attendances);
        } catch (error) {
            console.error("Connection or attendance retrieval failed:", error);

            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            }
        } finally {
            if (connectionOpened) {
                try {
                    await zkEvents.Disconnect();
                } catch (disconnectError) {
                    console.error("Error disconnecting:", disconnectError);
                }
            }
        }
    },
    //Clear attendece
    async ClearAttendances()
    {
        let connectionOpened = false;

        try{
            await zkEvents.Connect();
            connectionOpened = true;
            await zkEvents.ClearAttendances();
            await zkEvents.Disconnect();
            connectionOpened = false;
            return res.json({message:"Attendances Cleared"});
        }catch(error){
            console.error("Connection or attendance clear failed:", error);

            if (!res.headersSent) {
                res.status(500).json({ error: error.message });
            }
        }finally{
            if (connectionOpened) {
                try {
                    await zkEvents.Disconnect();
                } catch (disconnectError) {
                    console.error("Error disconnecting:", disconnectError);
                }
            }
        }
    },
    //Send attendence to HRMS system from fetchAttendances
    async sendAttendancesToHRMS(req,res){
        try{
        var deviceInUse = cache.get("deviceInUse");
        console.log("Device in use: ", deviceInUse);
        if(deviceInUse==true){
            logger.info("Device in use");
            return;
        }
        var date= req.query.date;
        console.log("Date requested " +date);
        cache.put("deviceInUse", true);
        await zkEvents.Connect();
        var attendances = await zkEvents.AttendancesFiltered(date);
        await zkEvents.Disconnect();
        //Send attendances to HRMS system
        let data = JSON.stringify({ data: attendances });
        console.log(data);
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
        axios.request(config)
        .then((response) => {
            logger.info(JSON.stringify(response.data));
            cache.put("deviceInUse", false);
            zkEvents.Disconnect();
            // Only send the success response here, inside the asynchronous operation's resolution
            res.json({message: "Attendances sent to HRMS"});
        })
        .catch((error) => {
            logger.error(error);
            cache.put("deviceInUse", false);
            // Send an error response here, indicating the operation failed
            res.status(500).json({message: "Failed to send attendances to HRMS", error: error.toString()});
        });
    }catch(error){
        console.error("Connection or attendance retrieval failed:", error);

        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        }
        logger.error('error in post to hrms');
        logger.error(JSON.stringfy(error));
        await zkEvents.Disconnect();
        cache.put("deviceInUse", false);
        return res.json({message:"Failed to send attendances to HRMS " +error});
    }
    await zkEvents.Disconnect();
    cache.put("deviceInUse", false);
    }
};

module.exports = AttendanceController;
