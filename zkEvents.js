const ZKLib = require("./zklib");
const dayjs = require('dayjs');
const cache = require("memory-cache");
const deviceIp= "172.16.132.34"
const ATTENDANCE_CACHE_KEY = deviceIp; // to save the time of the last job

// Create instances for two devices
let zkInstance = new ZKLib(deviceIp, 4370, 10000);

const Connect = async () => {
  try {
    // Create sockets for both machines
    await zkInstance.createSocket();

    // console.log(await zkInstance.getInfo());
  } catch (e) {
    console.log(e);
    if (e.code === "EADDRINUSE") {
      // Handle address in use error
    }
  }
};

const lastJobTime = () => {
  const cachedAttendances = cache.get(ATTENDANCE_CACHE_KEY);

  if (cachedAttendances) {
    return cachedAttendances;
  } else {
    return null;
  }
};

const Attendances = async () => {
  const result = (await zkInstance.getAttendances()).data;

  const date = lastJobTime() ?? dayjs().startOf('day').hour(0);
  cache.put(ATTENDANCE_CACHE_KEY, dayjs(), 20 * 60 * 1000); // Cache for 10 minutes
  console.log(date.format());

  // Filter the combined array based on the date of today
  const filteredData = result.filter(
    (entry) => dayjs(entry.recordTime).diff(dayjs(date), 'second') > 0
  );

  return filteredData;
};

module.exports = {
  getAttendances: Attendances,
  Connect: Connect,
};
