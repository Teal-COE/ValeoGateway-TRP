const store = require('store2');
const moment = require('moment');
var toolctrl = require('./controller')
const stn_setting = require('../configuration/stn1_settings.json')
var noOfTools = stn_setting.no_of_tools

var toolCount = 0;
exports.toolLife = async function (val, stn) {
    var plcval = val
    var shiftId = "S" + val.ShiftNumber;
    var hours = new Date().getHours();
    var ampm = (hours >= 12) ? "PM" : "AM";
    if ((shiftId == "S1" || "S2") || (shiftId == "S3" && ampm == "PM")) {
        date = moment().format('DD-MM-YYYY');
    }
    else if (shiftId == "S3" && ampm == "AM") {
        date = moment().format('DD-MM-YYYY').subtract(1, 'd');
    }
    var Machinecode = stn_setting.machine_code[stn]
    var toolID;
    var toolid;
    var toolTags = [];
    var toolResetTags = [];
    for (var i = 1; i <= noOfTools; i++) {
        toolTags.push(val["tool" + i])//[tool1,tool2,tool3]
        toolResetTags.push(val["toolreset" + i])//[toolreset1,toolreset2,toolreset3]
    }
    timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')

    var tempToolTag = store.get('tool' + stn)
    if (tempToolTag !== null && JSON.stringify(tempToolTag) !== JSON.stringify(toolTags)) {
        toolTags.map((element, index) => {
            var tempToolID = store.get('toolids')
            toolID = "Stn" + Machinecode + "_Tool_" + (index + 1);
            toolid = (index + 1);
            toolCount = toolTags[index]
            if (tempToolID === toolID || toolID) {
                toolctrl.toolCounting(toolID, toolCount, Machinecode, timeStamp, date)
            }
            store.set('toolids' + stn, toolID)
            store.set('toolCount' + stn, toolCount)
            store.set('Machinecode', Machinecode)
        })
    }
    store.set('tool' + stn, toolTags)
    store.set('plcval', plcval)
    store.set('toolReset' + stn, toolResetTags)
}
