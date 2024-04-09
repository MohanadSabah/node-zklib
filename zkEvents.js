const ZKLib = require("./zklib");
const dayjs = require("dayjs");
const cache = require("memory-cache");
require('dotenv').config();

const deviceIp= process.env.FP_IP|| "172.16.254.190";


const ATTENDANCE_CACHE_KEY = deviceIp; // to save the time of the last job

// Create instances for two devices
let zkInstance = new ZKLib(deviceIp, 4370, 10000);

const Connect = async () => {
  try {
    await zkInstance.createSocket();
  } catch (e) {
    console.log(e);
    if (e.code === "EADDRINUSE") {
      // Handle address in use error
    }
  }
};

const Disconnect = async () => {
  await zkInstance.disconnect();
};
const freeData = async () => {
  return await zkInstance.freeData();
}

const lastJobTime = () => {
  const cachedAttendances = cache.get(ATTENDANCE_CACHE_KEY);
  cache.put(ATTENDANCE_CACHE_KEY, dayjs().subtract(10, 'minute'), 20 * 60 * 1000); // Cache for 20 minutes
  if (cachedAttendances) {
    return cachedAttendances;
  } else {
    return dayjs().startOf("day").hour(0);
  }
};

const Attendances = async () => {
  const date = lastJobTime();
  var result = null;
  result = (await zkInstance.getAttendances()).data;
  
  console.log("date: ", date.format());

  var filteredData = [];
  filteredData = result.filter(
    (entry) => dayjs(entry.recordTime).diff(dayjs(date), "second") > 0
  );
  return filteredData;
};
const AttendancesFiltered = async (date_filter=null,recently_record=false) => {
  const date = lastJobTime();
  var result = null;
  result = (await zkInstance.getAttendances()).data;
  console.log("date: ", date.format());
  let filteredData = result;

  if (date_filter) {
    filteredData = filteredData.filter((entry) => {
      return dayjs(entry.recordTime).format('YYYY-MM-DD') === dayjs(date_filter).format('YYYY-MM-DD');
    });
  } 
  if (recently_record == "true") {
    console.log("recently_record: ", recently_record);
    filteredData = filteredData.filter((entry) => {
      return dayjs(entry.recordTime).diff(dayjs(date), "second") > 0;
    });
  }
 

  return filteredData;
};
const clearAttendanceLogs = async () => {
  return await zkInstance.clearAttendanceLog();
}
// zkInstance.getRealTimeLogs((data)=>{
//   // do something when some checkin
//   console.log(data)
// })

module.exports = {
  getAttendances: Attendances,
  Connect: Connect,
  Disconnect: Disconnect,
  AttendancesFiltered : AttendancesFiltered,
  clearAttendanceLogs: clearAttendanceLogs,
};