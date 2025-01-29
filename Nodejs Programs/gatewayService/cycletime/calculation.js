const store = require('store2');
var moment = require('moment')
const ctrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')
exports.rawCycletime = async function (data, stn) {
    
    var date;
    var temp_TotalPartsValue = store.get("totalParts" + stn);
    var temp_OkPartsValue = store.get("okParts" + stn);
    var temp_NokPartsValue = store.get("nokParts" + stn);
    var totalParts = data?.Total_parts;
    var okParts = data?.OK_parts;
    var nokParts = data?.NOT_parts;
    var shiftId = "S" + data?.shift;
    
    console.log(temp_TotalPartsValue,totalParts)
    store.set("totalParts" + stn, totalParts)
    store.set("okParts" + stn, okParts)
    store.set("nokParts" + stn, nokParts)
    var reason = "";
    if (temp_TotalPartsValue !== null && temp_TotalPartsValue !== totalParts && data?.numberof_fixtures !== 0) {
        for (var i = 1; i <= stn_setting.numberof_fixtures; i++) {
            reason += "R" + data['Rej_Reason_' + i] + " ";
        }
    }
    else if (temp_TotalPartsValue == totalParts || data?.numberof_fixtures <= 0) {
        var reason = 'R0' + 'R0' + 'R0' + 'R0'
    }
    else if (okParts == 0) {
        reason = "";
    }
    if (okParts < temp_OkPartsValue) { var Ok_value = 0; }
    else { var Ok_value = okParts - temp_OkPartsValue; }
    if (nokParts < temp_NokPartsValue) { var NOk_value = 0; }
    else { var NOk_value = nokParts - temp_NokPartsValue; }

    datetime = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')

    var hours = moment().format('HH');
    var ampm = (hours >= 12) ? "PM" : "AM";

    if ((shiftId == "S1" || "S2") || (shiftId == "S3" && ampm == "PM")) {
        date = moment().format('YYYY-MM-DD')
    }
    else if (shiftId == "S3" && ampm == "AM") {
        date = moment().format('YYYY-MM-DD')
    }
    if (temp_TotalPartsValue !== null && temp_TotalPartsValue !== totalParts) {
        console.log(stn)
        var machinecode = "M" + stn_setting.machine_code[stn]
        ctrl.onchangeLogging(machinecode,
            shiftId,
            +data?.variantNumber,
            Ok_value,
            NOk_value,
            reason,
            datetime,
            date)
    }
}