const store = require('store2');
var dbhero = require('../model_db')
const moment = require('moment');
var MAcalc = require('./controller')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json')

exports.machineAlarm = async function (val, stn) {
    let array = [];
    var shiftNo = "S" + val.shift;
    var Machinecode = stn_setting.machine_code[stn]
    var stationcode = stn_setting.machine_code[stn]
    var bit = stn_setting.bit;
    var padding;
    var tempPadding;
    var binaryConvertion;
    var tempBinaryConvertion;
    var noofalarm = stn_setting.no_of_alarm;
    var bitReverasal = stn_setting.bitReversal;
    var tempAlarm = store.get("alarm" + stn);
    // console.log(tempAlarm)
    var alarmWord = [];
    for (var i = 1; i <= noofalarm; i++) {
        alarmWord.push(val["AlmWord_" + i]);
    }
    // console.log(tempAlarm)
    for (var i = 0; i < bit; i++) {
        array.push(0);
    }
    // console.log(array)
    if (JSON.stringify(alarmWord) !== JSON.stringify(tempAlarm)) {
        if (tempAlarm == null) {
            tempAlarm = array
        }
        alarmWord.forEach((element, index) => {
            binaryConvertion = Number(element).toString(2);
            tempBinaryConvertion = Number(tempAlarm[index]).toString(2);
            // console.log("binaryconvert",binaryConvertion)
            var reverse = [...binaryConvertion].reverse().join("");
            var tempReverse = [...tempBinaryConvertion].reverse().join("");
            // console.log("reverse",reverse)
            padding = String(reverse).padEnd(bit, '0');
            tempPadding = String(tempReverse).padEnd(bit, '0');
            // console.log("padding",padding)
            if (bitReverasal == true) {
                padding = String(reverse).padStart(bit, '0');
                tempPadding = String(tempReverse).padStart(bit, '0');
            }
            var binaryArray = Array.from(padding.toString()).map(Number);
            var tempBinaryArray = Array.from(tempPadding.toString()).map(Number);
            for (var i = 0; i <= binaryArray.length; i++) {
                // array.push(binaryArray[i])
                if (binaryArray[i] !== tempBinaryArray[i] && binaryArray[i] == 1) {
                    var alarmText = "Stn" + stationcode + "_Alm_A" + (index * bit + i + 1);
                    // console.log(alarmText)
                    startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                    // console.log(alarmText);
                    var almS = 1;
                    var losS = 0;
                    putData(alarmText, startTime);
                    // MAcalc.alarmStartime(alarmText,startTime)

                    var machineStatus = generateMachineStatus(val);
                    // console.log(alarmText,0,machineStatus,shiftNo,Machinecode,almS,losS)
                    exportDataAlert(alarmText, 0, machineStatus, shiftNo, Machinecode, almS, losS);
                }
                else if (binaryArray[i] == 0) {
                    var downAlarm = "Stn" + stationcode + "_Alm_A" + (index * bit + i + 1);
                    apiCall(val, downAlarm, stationcode);
                }
                store.set("tempalarm", alarmText);
            }
        })
    }
    store.set("alarm" + stn, alarmWord);
}

function putData(alarm, start) {
    MAcalc.alarmStartime(alarm, start)
}

async function apiCall(plcval, AlarmVal, Machinecode) {
    let sqlhero = `select * from hero.dbo.alarm_time`;
    const result = await dbhero.query(sqlhero)
    if (result) {
        result[0].forEach(element => {
            if (element.AlarmCode == AlarmVal) {

                TokenGeneration(plcval, element.AlarmCode, element.StartTime, Machinecode);
                deleteAlarm(element.AlarmCode);
            }
        })
    }
}
function deleteAlarm(eliminate) {
    MAcalc.alarmDelete(eliminate)
}

async function TokenGeneration(plcval, alarm, startTime, Machinecode) {
    exportData(plcval, alarm, startTime, Machinecode)
}

function generateMachineStatus(val) {
    var machineStatus;
    var errorActive = val.error_active;
    var autoModeSelected = val.automode_selected;
    var autoModeRunning = val.automode_running;
    var manualMode = val.manualmode_selected;
    var lossActive = val.loss;
    var Break = val.break;
    if (Break == true) {
        machineStatus = 4;
    }
    else if (errorActive == true) {
        machineStatus = 0;
    }
    else if (manualMode == true || lossActive == true) {
        machineStatus = 3;
    }
    else if (autoModeRunning == true) {
        machineStatus = 1;
    }
    else if (autoModeSelected == true && autoModeRunning !== true && errorActive !== true) {
        machineStatus = 3;
    }
    return machineStatus;
}

async function exportDataAlert(alarm, loss, machinestatus, shift, machinecode, almS, losS) {
    var timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
    var date = moment().format('YYYY-MM-DD')

    try {
        let sqlhero = `insert into hero.dbo.AlertRAWTable(Time_Stamp,Date,Live_Alarm,Live_Loss,Machine_Status,Shift_Id,Line_Code,Machine_Code,CompanyCode,PlantCode,Status_Alarm,Status_Loss)values('${timeStamp}','${date}','${alarm}','${loss}','${machinestatus}','${shift}','${stn_setting.line_code}','M${machinecode}','${stn_setting.company_code}','${stn_setting.plant_code}','${almS}','${losS}')`;
        dbhero.query(sqlhero, (err, result) => {
            if (err) {
                datalogger.dataLog("AlertRAWTable", "onchangeLogging HeroDB", machinecode, "insert query", err);
            }
        });
        console.log(':: Alarm alert RAWTable ::')
    } catch (error) {
        datalogger.dataLog("AlertRAWTable", "onchangeLogging", machinecode, "insert query", err);
    }
}

async function exportData(plcVal, alarmCode, startTime, Machinecode) {
    var date = moment().format('YYYY-MM-DD');
    endTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var shiftNo = "S" + plcVal.shift;
    try {
        let sql = `insert into hero.dbo.MachineAlarm(Line_Code,Machine_Code,Shift_ID,Alarm_ID,Start_Time,End_Time,Time_Stamp,Date,CompanyCode,PlantCode)values('${stn_setting.line_code}','M${Machinecode}','${shiftNo}','${alarmCode}','${startTime}','${endTime}','${timeStamp}','${date}','${stn_setting.company_code}','${stn_setting.plant_code}')`;
        dbhero.query(sql, (err, result) => {
            if (err) {
                datalogger.dataLog("MachineAlarm", "Datalogging", "Machinecode", "data inserting", err);
            }
        });
        console.log('MachineAlarm  Inserted!')
    } catch (error) {
        datalogger.dataLog("MachineAlarm", "Datalogging", "M" + Machinecode, "data inserting", error);
    }
    var almS = 0;
    var losS = 0;
    var machineStatus = generateMachineStatus(plcVal);
    exportDataAlert(alarmCode, 0, machineStatus, shiftNo, Machinecode, almS, losS);
}

// Line_Code,Machine_Code,Shift_ID,Alarm_ID,Start_Time,End_Time,Time_Stamp,Date,CompanyCode,PlantCode
// Start_Time: startTime,
// End_Time: endTime,
// Time_Stamp: timeStamp,
// Date: date,
// CompanyCode: stn_setting.company_code,
// PlantCode: stn_setting.plant_code