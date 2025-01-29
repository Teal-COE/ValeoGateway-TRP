//var db = require('../model_db')
var dbhero = require('../model_db')
const stn_setting = require('../configuration/stn1_settings.json')
const datalogger = require('../datalogger')

exports.insert = async function (Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode , varientCode) {
 
  const sql = require('mssql');

  const config = {
    user: 'sa',
    password: 'teal@123',
    server: '192.168.1.250', 
    database: 'iotkpi',
    options: {
      encrypt: true, // for Azure
      trustServerCertificate: true // change to true for local dev / self-signed certs
    }
  };



  try {
    if (Con == true) {
    
      // let sqlhero = `insert into iotkpi.dbo.RAWTable(Time_Stamp,Date,Shift_Id,Line_Code,Machine_Code,Variant_Code,Machine_Status,OK_Parts,NOK_Parts,Rework_Parts, Rejection_Reasons,Auto__Mode_Selected,Manual_Mode_Slected,Auto_Mode_Running,CompanyCode,PlantCode,OperatorID,Live_Alarm,Live_Loss,Batch_code)values('${timeStamp}','${Cdate}','${shiftId}','${stn_setting.line_code}','${MachineCode}','V1','${machineStatus}','${data.OK_parts}','${data.NOT_parts}','0','${stn_setting.rejection_reason}','${+data.automode_selected}','${data.manualmode_selected}','${data.automode_running}','${stn_setting.company_code}','${stn_setting.plant_code}','${stn_setting.operator_ID}','${alarmState}','${lossState}','${batchCode}')`;
      ///let sqlhero =`insert into iotkpi.dbo.RAWTable(Time_Stamp,Date,Shift_Id,Line_Code,Machine_Code,Variant_Code,Machine_Status,OK_Parts,NOK_Parts,Rework_Parts, Rejection_Reasons,Auto__Mode_Selected,Manual_Mode_Slected,Auto_Mode_Running,CompanyCode,PlantCode,OperatorID,Live_Alarm,Live_Loss,Batch_code) values('2024-07-18 16:07:20.920','2024-07-18','S1','IGSA01','M1','V1','1','10','2','0','reason','1','0','1','TEAL_VALEO','TEAL_VALEO01','null','0','0','B2024-07-18 16:07:20.920')`
      // console.log(timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode)
      
  

      async function getUsers() {
        try {
          const result = await sql.query`insert into IOT_IGSA01.dbo.RAWTable(Time_Stamp,Date,Shift_Id,Line_Code,Machine_Code,Variant_Code,Machine_Status,OK_Parts,NOK_Parts,Rework_Parts, Rejection_Reasons,Auto__Mode_Selected,Manual_Mode_Slected,Auto_Mode_Running,CompanyCode,PlantCode,OperatorID,Live_Alarm,Live_Loss,Batch_code) values(${timeStamp},${Cdate},${shiftId},'IGSA01',${MachineCode},${varientCode},${machineStatus},${data.OK_parts},${data.NOT_parts},'0','reason',${data.automode_selected},${data.manualmode_selected},${data.automode_running},'TEAL_VALEO','TEAL_VALEO01','null','0','0',${batchCode})`;
          // console.log(result);
        } catch (err) {
          console.error('Query failed: ', err);
        }
      }
      
      getUsers();

      
      // dbhero.query(sqlhero, (err, result) => {
      //   if (err) {
      //     console.log('>>>kkk>>>>>>>>')

      //     // datalogger.dataLog("RawTable", "insert", MachineCode, "insert query", err);
      //   }
      //   console.log('>>>>>>>>>>>')
      // });

    }
  } catch (error) {
    console.log('>>>>>RawTable>>>>>>')
    // datalogger.dataLog("RawTable", "insert", MachineCode, "insert query", error);
  }
}