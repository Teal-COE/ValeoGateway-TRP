var db = require('../model_db')
var dbhero = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json')

exports.onchangeLogging = async function (machinecode, shiftId, variantCode, Ok_value, NOk_value, reason, datetime, date) {
  const sql = require('mssql');
  try {
    // let sql = `insert into raw_cycletime(Line_Code,Machine_Code,Shift_id,Variant_code,Companycode,Plantcode,OperatorID,OK_Parts,NOK_Parts,Rework_Parts,Reject_Reason,Time_Stamp,date,status)values('${stn_setting.line_code}','${machinecode}','${shiftId}','V${variantCode}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.operator_ID}','${Ok_value}','${NOk_value}','${stn_setting.rework_parts}','${reason}','${datetime}','${date}','true')`;
    // db.query(sql, (err, result) => {
    //   if (err) {
    //     datalogger.dataLog("CycleTime", "onchangeLogging", machinecode, "insert query", err);
    //   }
    // });
    async function getUsers() {
      try {
        const result = await sql.query`insert into iotkpi.dbo.CycleTime(Line_Code,Machine_Code,Shift_Id,Variant_Code,Companycode,Plantcode,OperatorID,OK_Parts,NOK_Parts,Rework_Parts,Reject_Reason,Time_Stamp)values(${stn_setting.line_code},${machinecode},${shiftId},'V1',${stn_setting.company_code},${stn_setting.plant_code},${stn_setting.operator_ID},${Ok_value},${NOk_value},${stn_setting.rework_parts},${reason},${datetime})`;
        console.log(result);
      } catch (err) {
        console.error('Query failed: ', err);
      }
    }
    
    getUsers();





    console.log('------------')
    //const result = await sql.query `insert into iotkpi.dbo.CycleTime(Line_Code,Machine_Code,Shift_Id,Variant_Code,Companycode,Plantcode,OperatorID,OK_Parts,NOK_Parts,Rework_Parts,Reject_Reason,Time_Stamp)values(${stn_setting.line_code},${machinecode},${shiftId},'V1',${stn_setting.company_code},${stn_setting.plant_code},${stn_setting.operator_ID},${Ok_value},${NOk_value},${stn_setting.rework_parts},${reason},${datetime})`;
    // dbhero.query(sqlhero, (err, result) => {
    //   if (err) {
    //     // datalogger.dataLog("CycleTime", "onchangeLogging HeroDB", machinecode, "insert query", err);
    //     console.log('>>>>>1>>>>>>')
    //   }
    // });
  } 
  catch (error) {
    // datalogger.dataLog("CycleTime", "onchangeLogging", machinecode, "insert query", err);
    console.log('>>>>>CTTable>>>>>>',error)
  }
}