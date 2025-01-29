const store = require('store2');
const moment = require('moment');
const ctrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')

exports.plcvalues = async function (data, Con, stn) {
    var machineStatus = "";
    var batchCode = "";
    var alarmState = "";
    var lossState = "";
    var shiftId = "S" + data?.shift;
    var varientCode = "V" + data?.variantNumber;
//   console.log( data)
    // var varientCode = data?.variantNumber;

    var MachineCode = "M" + stn_setting.machine_code[stn];

    var lossTags = [];
    for (var i = 1; i <= 12; i++) {
        lossTags.push(data["loss_L" + i]);
    }
    var lossActive = lossTags.includes(true);

    //console.log(stn,data?.ChangeoverTime)
    if (Con == false) {
        machineStatus = 5;
    }

    else if (data?.ChangeoverTime == true) {
        machineStatus = 6;
    }

    else if (data?.break == true) {
        machineStatus = 4;

    }
    else if (data?.error_active == true) {
        machineStatus = 0;

    }
    else if (data?.manualmode_selected == true || lossActive == true ) {
        machineStatus = 3;
    }
    else if (data?.automode_running == true) {
        machineStatus = 1;
    }
    else if ((data?.automode_selected == true && data?.automode_running !== true )&& data?.error_active !== true) {
        machineStatus = 3;
    }
    else {
        machineStatus = 3;
    }

// 2024-12-02

   var previousStatus = store.get("machineStatus_" + MachineCode) || false;
    if (machineStatus === 0 || machineStatus === 1) {
        store.set("machineStatus_" + MachineCode, machineStatus === 0);
    }
    if(machineStatus === 3 && previousStatus === true){
        machineStatus = 0;
    }

    console.log("New Logic");
// 2024-12-02


    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    if ((shiftId === "S1" ||shiftId === "S2") || (shiftId === "S3" && ampm === "PM")) {
        Cdate = moment().format('YYYY-MM-DD')
    }
    else if (shiftId === "S3" && ampm === "AM") {
        Cdate = moment().subtract(1,'days').format('YYYY-MM-DD')
    }
    var getShift = store.get("shift_" + MachineCode);
    var getVarientCode = store.get("varientCode_" + MachineCode);

    // Cdate = moment().format('YYYY-MM-DD')
    
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
    if (getShift !== shiftId || getVarientCode !== varientCode) {
        batchCode = "B" + timeStamp;
        store.set("batchcode_" + MachineCode, batchCode)
    }
    else if (getShift == shiftId || getVarientCode == varientCode) {
        var batchCode = store.get("batchcode_" + MachineCode)
    }
    store.set("shift_" + MachineCode, shiftId);
    store.set("varientCode_" + MachineCode, varientCode);
    if (data?.error_active == true) {
        alarmState = "ALM";
    } else {
        alarmState = " ";
    }

    if (lossActive == true) {
        lossState = "LOS";
    }
    else if (lossActive == false) {
        lossState = " ";
    }
    
    // console.log(timeStamp,machineStatus)
    ctrl.insert(Con, data, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode , varientCode)
    // console.log(Con, timeStamp, Cdate, shiftId, MachineCode, machineStatus, alarmState, lossState, batchCode)
}


