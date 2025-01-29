const moment = require('moment');
const store = require("store2");
const Crictrl = require('./controller');
const stn_setting = require('../configuration/stn1_settings.json');
var totalIndex = stn_setting.total_index;

exports.checkOperation = async function (values, stn) {
    var tempOperationBitTag = store.get("operationBitTag" + stn) || [false, false, false];
    var tempTotalParts = store.get("tempTotalParts" + stn);
    var operationBitTag = [];
    for (var i = 1; i <= totalIndex; i++) {
        operationBitTag.push(values["element_" + i]);
    }
    var totalParts = values?.Total_parts;
    if (
        (tempOperationBitTag !== null &&
            (tempOperationBitTag.map((state, idx) => state != operationBitTag[idx] && operationBitTag[idx]).indexOf(true) !== -1) &&
            plcCommunication == true) ||
        (tempTotalParts !== null &&
            tempTotalParts !== totalParts)
    ) {
        criticalCycletime(values, stn)
    }
    store.set("operationBitTag" + stn, operationBitTag)
    store.set("tempTotalParts" + stn, totalParts)
}

function criticalCycletime(Val, stn) {
    var m_code = stn_setting.machine_code[stn]
    var machine = "M"+stn_setting.machine_code[stn]
    var shift = "S"+Val?.shift
    var date = moment().format('YYYY-MM-DD')
    // if ((shiftId === "S1" ||shiftId === "S2") || (shiftId === "S3" && ampm == "PM")) {
    //     date = moment().format('DD-MM-YYYY')
    // }
    // else if (shiftId === "S3" && ampm == "AM") {
    //     date = moment().subtract(1,'days').format('DD-MM-YYYY')
    // }
    var timeStamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
    var totalParts = Val?.Total_parts;
    var operations1;
    var operations;
    var tempOperationindexTag = store.get("operationindexTags" + stn) || [false, false, false];
    var indexTags = [];
    for (var i = 1; i <= totalIndex; i++) {
        indexTags.push(Val["element_" + i]);
    }
    indexTags.forEach((data, index) => {
        if (data == true) {
            operations1 = "Stn" + m_code + "_Index_" + (index + 1);
        }
    })

    var tempTotal = store.get('total-parts' + stn)
    if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) == -1) && (totalParts !== tempTotal)) {
        operations = "Stn" + m_code;
    }
    else if ((tempOperationindexTag.map((state, idx) => state != indexTags[idx] && indexTags[idx]).indexOf(true) !== -1)) {
        operations = operations1;
    }
    Crictrl.dataInserting(
        date,
        machine,
        Val?.variantNumber,
        operations,
        Val?.actualCycletime,
        Val?.actualCycletime,
        Val?.OK_parts,
        Val?.NOT_parts,
        totalParts,
        shift,
        timeStamp)

    store.set("operationTags" + stn, operations1)
    store.set("operationindexTags" + stn, indexTags)
    store.set("total-parts" + stn, totalParts)
}