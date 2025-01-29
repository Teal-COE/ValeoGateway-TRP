const store = require('store2');
var dbhero = require('../model_db')
var moment = require('moment')
const datalogger = require('../datalogger')
var lossCtrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')
let as_flag = 0;
let mm_flag = 0;

exports.changedLoss = async function (getVal, stn) {
    var lossTags = [];
    var Machinecode = stn_setting.machine_code[stn]
    var autoModeSelected = getVal?.automode_selected;
    var autoModeRunning = getVal?.automode_running;
    var manualModeSelected = getVal?.manualmode_selected;
    var errorActive = getVal?.error_active;

    for (var i = 1; i <= 12; i++) {
        lossTags.push(getVal["loss_L" + i]);
    }
    var lossArray = JSON.stringify(lossTags);
    var tempAutomodeSelected = store.get("AutoModeSelect" + stn);
    var tempAutoModeRunning = store.get("AutoModeRun" + stn);
    var tempManualmodeSelected = store.get("ManualMode" + stn);
    var tempErrorActive = store.get("errorActive" + stn);
    var templossTags = store.get("lossTag" + stn);

    if (tempAutomodeSelected !== autoModeSelected || tempAutoModeRunning !== autoModeRunning || tempManualmodeSelected !== manualModeSelected || tempErrorActive !== errorActive || templossTags !== lossArray) {
        Loss(getVal, Machinecode)
    }

    store.set("AutoModeSelect" + stn, autoModeSelected);
    store.set("AutoModeRun" + stn, autoModeRunning);
    store.set("ManualMode" + stn, manualModeSelected);
    store.set("errorActive" + stn, errorActive);
    store.set("lossTag" + stn, lossArray);
}

function Loss(val, Machinecode) {
    var lossText;
    var startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');

    var loss = [];
    for (var i = 1; i <= 12; i++) {
        loss.push(+val["loss_L" + i]);

        //console.log(val["-----------------------------------"+"loss_L" + i]);
    }
    var tempLoss = store.get("loss" + Machinecode);

    // obs 2492024
    var autoModeSelected = val?.automode_selected;
    var autoModeRunning = val?.automode_running;
    var manualModeSelected = val?.manualmode_selected;
    var errorActive = val?.error_active;


    if (autoModeSelected === true && autoModeRunning === false && manualModeSelected === false && errorActive === false ) {
        if (as_flag !== 1){
            console.log("only auto selected ideal condition");
            startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            var loss_txt =  "Stn" + Machinecode + "_Los_L20";
            as_flag = 1;
            putData(loss_txt, startTime);
        }
    }
    else{
        var loss_txt =  "Stn" + Machinecode + "_Los_L20";
        as_flag = 0;
        apiCall(val, loss_txt, Machinecode);
 
    }

    if (autoModeSelected === false && autoModeRunning === false && manualModeSelected === true && errorActive === false ) {
        if (mm_flag !== 1){
            console.log("only manual mode ideal condition");
            startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
            var loss_txt =  "Stn" + Machinecode + "_Los_L19";
            mm_flag = 1;
            putData(loss_txt, startTime);
        }
    }
    else{
        var loss_txt =  "Stn" + Machinecode + "_Los_L19";
        mm_flag = 0;
        apiCall(val, loss_txt, Machinecode);
    }

    //obs





    if (JSON.stringify(loss) !== JSON.stringify(tempLoss)) {
        loss.forEach((element, index) => {                                                                                  // loss handling
            if (element == 1) {
                console.log("i am in start time",element);
                lossText = "Stn" + Machinecode + "_Los_L" + (index + 3);
                startTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                putData(lossText, startTime);
            }
            else if (element == 0) {
                var downLoss = "Stn" + Machinecode + "_Los_L" + (index + 3);

                apiCall(val, downLoss, Machinecode)
            }
        })
    }
    store.set("loss" + Machinecode, loss);
}

function putData(loss, start) {
    lossCtrl.lossStarttime(loss, start)
}

async function apiCall(plcval, lossVal, Machinecode) {
    const sql = require('mssql');
    // let sqlhero = `select * from hero.dbo.loss_time`;
    const result = await sql.query`select * from IOT_IGSA01.dbo.loss_time where losstext =  ${lossVal}`;
    
    if (result.recordset.length > 0) {
        const alm_status  = result.recordset[0].status;
        let start_time = result.recordset[0].StartTime;
        //console.log(lossVal , "::" , alm_status , "::" , start_time );
        post_loss_to_db(plcval, lossVal, start_time, Machinecode);

    }
    // else{
    //     console.log(lossVal , ":: No alarm");
    // }

}

async function post_loss_to_db(plcVal, loss, startTime, Machinecode){
    var date = moment().format('YYYY-MM-DD');;
    endTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var shiftNo = "S" + plcVal?.shift;
    var hours = new Date().getHours();
    var Machinecode ="M"+Machinecode;
    var ampm = (hours >= 12) ? "PM" : "AM";
    if ((shiftNo == "S1" || "S2") || (shiftId == "S3" && ampm == "PM")) {
        date = moment().format('YYYY-MM-DD');
    }
    else if (shiftId == "S3" && ampm == "AM") {
        date = moment().format('YYYY-MM-DD').subtract(1, 'd');
    }

    try {
        const sql = require('mssql');
        const data = await sql.query`insert into IOT_IGSA01.dbo.machineloss(Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data)values(${stn_setting.line_code},${Machinecode},${shiftNo},${loss},${startTime},${endTime},${timeStamp},${stn_setting.company_code},${stn_setting.plant_code},${date},'','','')`;
       // console.log('machineloss  Inserted for ',loss , "::" , startTime)
        const del = await sql.query`delete from IOT_IGSA01.dbo.loss_time where LossText=${loss}`;
       // console.log('deleted from machine loss',loss)
    } catch (error) {
        console.log("failed to post loss" , )
    }



}




function deleteLoss(eliminate) {
    lossCtrl.deleteloss(eliminate)
}

async function TokenGeneration(plcval, loss, startTime, Machinecode) {
    //console.log("i am ijn token gen");
    exportData(plcval, loss, startTime, Machinecode)
}

async function exportData(plcVal, loss, startTime, Machinecode) {
    var date = moment().format('YYYY-MM-DD');;
    endTime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var shiftNo = "S" + plcVal?.shift;
    var hours = new Date().getHours();
    var Machinecode ="M"+Machinecode;
    var ampm = (hours >= 12) ? "PM" : "AM";
    if ((shiftNo == "S1" || "S2") || (shiftId == "S3" && ampm == "PM")) {
        date = moment().format('YYYY-MM-DD');
    }
    else if (shiftId == "S3" && ampm == "AM") {
        date = moment().format('YYYY-MM-DD').subtract(1, 'd');
    }
    //console.log("ready to post");
    try {
        const sql = require('mssql');
        const data = await sql.query`insert into IOT_IGSA01.dbo.machineloss(Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data)values(${stn_setting.line_code},${Machinecode},${shiftNo},${loss},${startTime},${endTime},${timeStamp},${stn_setting.company_code},${stn_setting.plant_code},${date},'','','')`;
        // let sqlhero = `insert into iotkpi.dbo.machineloss(Line_Code,Machine_Code,Shift_ID,Loss_ID,Start_Time,End_Time,Time_Stamp,CompanyCode,PlantCode,Date,Reason,Remarks,Actual_Data)values('${stn_setting.line_code}','M${Machinecode}','${shiftNo}','${loss}','${startTime}','${endTime}','${timeStamp}','${stn_setting.company_code}','${stn_setting.plant_code}','${date}','','','')`;
        
        deleteLoss(loss);
        
        // dbhero.query(sqlhero, (err, result) => {
        //     if (err) {
        //         datalogger.dataLog("Loss", "Inserting", MachineCode, "offline data stored", err);
        //     }
        // });
       // console.log('>>>>machineloss  Inserted>>>>')
    } catch (error) {
        // console.log("error while posting" , error);
        datalogger.dataLog("Loss", "Inserting", MachineCode, "data stored", error);
    }
}
