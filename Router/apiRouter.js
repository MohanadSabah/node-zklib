const express = require('express');
const auth = require('../auth/auth');
const AttendanceController = require("../controllers/AttendanceController"); // Adjust the path as necessary
const apiRouter = express.Router();
//Routes:
apiRouter.get('/attendances', auth,async (req, res) => {
    await AttendanceController.fetchAttendances(req, res);
});
apiRouter.delete('/attendances',auth,async (req, res) => {
    await AttendanceController.ClearAttendances(req, res);
});
apiRouter.post('/attendances',auth,async (req, res) => {
    await AttendanceController.sendAttendancesToHRMS(req, res);
});


module.exports = apiRouter;
