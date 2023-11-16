const ZKLib = require('./zklib')
const test = async () => {

    let zkInstance = new ZKLib('172.16.132.34', 4370, 10000);
    try {
        // Create socket to machine 
        await zkInstance.createSocket()


        // Get general info like logCapacity, user counts, logs count
        // It's really useful to check the status of device 
        console.log(await zkInstance.getInfo())
    } catch (e) {
        console.log(e)
        if (e.code === 'EADDRINUSE') {
        }
    }


    const attendances = await zkInstance.getAttendances((percent, total)=>{
        // this callbacks take params is the percent of data downloaded and total data need to download 
        console.log(total)
    })
    console.log(attendances)

     // YOu can also read realtime log by getRealTimelogs function
  
    // console.log('check users', users)

    zkInstance.getRealTimeLogs((data, error) => {
        console.log(11)
        if (error) {
            console.error('Error while receiving real-time logs:', error);
        } else {
            // Process and handle the real-time log data
            console.log('Received real-time log data:', data);
        }
    });
    
    // const a=await zkInstance.executeCmd(CMD.CMD_GET_FREE_SIZES, '')
    // console.log(a.readUIntLE(3, 4))
   
}
    test()
