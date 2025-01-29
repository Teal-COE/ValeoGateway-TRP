const moment = require('moment');
var dbhero = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json')

exports.exportData = async function (date, alarm, loss, machinestatus, shift, machineCode, almS, losS) {
  var timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
  try {
    let sqlhero = `insert into hero.dbo.AlertRAWTable(Time_Stamp,Date,Live_Alarm,Live_Loss,Machine_Status,Shift_Id,Line_Code,Machine_Code,CompanyCode,PlantCode,Status_Alarm,Status_Loss)values('${timeStamp}','${date}','${alarm}','${loss}','${machinestatus}','${shift}','${stn_setting.line_code}','${machineCode}','${stn_setting.company_code}','${stn_setting.plant_code}','${almS}','${losS}')`;
    dbhero.query(sqlhero, (err, result) => {
      if (err) {
        datalogger.dataLog("AlertRAWTable", "onchangeLogging HeroDB", machinecode, "insert query", err);
      }
    });
    console.log('>>>>AlertRAWTable<<<<')
  } catch (error) {
    datalogger.dataLog("AlertRAWTable", "onchangeLogging", machinecode, "insert query", err);
  }
}