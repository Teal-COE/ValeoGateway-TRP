var dbhero = require('../model_db')
const datalogger = require('../datalogger')

exports.  lossStarttime = async function (loss, start) {
  
  try {
    var lossDB;
    const sql = require('mssql');
    const data = await sql.query`select LossText from IOT_IGSA01.dbo.loss_time where LossText=${loss}`;
    // const data = await dbhero.query(`select LossText from iotkpi.dbo.loss_time where LossText='${loss}'`);
    
    //console.log(data);
    if (data) {
      data[0]?.forEach(data => {
        lossDB = data?.LossText;
      })
      if (!lossDB) {
       
        // let sql = `insert into iotkpi.dbo.loss_time(lossText,StartTime,status)values('${loss}','${start}','true')`;
        const res = await sql.query`insert into IOT_IGSA01.dbo.loss_time(lossText,StartTime,status)values(${loss},${start},'true')`;
        //console.log("data inserted to loss_time "+{loss},{start});
        // dbhero.query(sql, (err, result) => {
        //   if (err) {
        //     datalogger.dataLog("Loss", "lossStarttime", "stn", "loss starttime stored", err);
        //   }
        // });
      }
    }
  } catch (error) {
    console.log("it is in error");
    datalogger.dataLog("Loss", "lossStarttime", "stn", "loss starttime stored", error);
  }
}

exports.deleteloss = async function (eliminate) {
 // console.log("delete loss");
  try {
    const sql = require('mssql');
    const data = await sql.query`delete from IOT_IGSA01.dbo.loss_time where LossText=${eliminate}`;
    // let eliminateElement = `delete from iotkpi.dbo.loss_time where LossText='${eliminate}'`;
    // dbhero.query(eliminateElement, (err, result) => {
    //   if (err) {
    //     datalogger.dataLog("Loss", "deleteloss", "stn", "loss starttime stored", err);
    //   }
    // })
  } catch (error) {
    datalogger.dataLog("Loss", "deleteloss", "stn", "loss starttime stored", error);
  }
}
//Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data