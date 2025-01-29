const store = require('store2')
const cors = require('cors')
const axios = require('axios')
const express = require('express')
const bodyparser = require('body-parser')
const settings = require('./configuration/config.json')
const db = require('./model_db')
const rawCtrl = require('./rawtable/controller')
const rawCalc = require('./rawtable/calculation')
const cycleCalc = require('./cycletime/calculation')
const criticalCalc = require('./criticalcycletime/calculation')
const lossCalc = require('./loss/calculation')
const alarmCalc = require('./machinealarm/calculation')
const alertCalc = require('./alertrawtable/calculation')
const diagnosticCalc = require('./diagnostic/calculation')
const getShift = require("./comman_fun.js")
const toolCalc = require('./toollife/calculation')

const app = express()
app.use(cors())
app.use(bodyparser.json())
app.use((err, req, res, next) => {
  if (err.code === 'EBUSY') {
    // Handle the EBUSY error here
    console.log('EBUSY error occurred:', err);
  }
  // else {
  //   // Pass the error to the next middleware
  //   next(err);
  // }
});
const port = 4001
app.listen(`${port}`, () => {
  console.log(`listening port on ${port}`)
})

var stationNo

app.post('/getErrordata', function (req, res) {
  var state = req.body.state
  if (state == '0') {
    db.query(
      `SELECT * FROM logging where  time_stamp > now() - interval 3 hour  ORDER BY id desc`,
      function (err, rows) {
        return res.json(rows)
      }
    )
  } else if (state == '1' || state == '2') {
    db.query(
      `SELECT * FROM logging where state='${req.body.state}' AND time_stamp > now() - interval 3 hour  ORDER BY id desc`,
      function (err, rows) {
        return res.json(rows)
      }
    )
  }
})

async function valuesReady() {
  const res = await axios.get(settings.plc_url + '/getPlcData')
  const plcs = Object.keys(res?.data)
  plcs.forEach(plc => {
    var connection = res.data[plc].connection

    stationNo = Object.keys(res?.data[plc])
    stationNo.slice(1).forEach(ele => {
      stn = res.data[plc][ele]
      result = connection
      stn.automode_running = stn?.automode_running || false
      stn.automode_selected = stn?.automode_selected || false
      stn.manualmode_selected = stn?.manualmode_selected || false
      stn.error_active = stn?.error_active || false
      stn.break = stn?.break || false
      stn.warning_active = stn?.warning_active || false
      stn.variantNumber = stn?.variantNumber || 0
      stn.OK_parts = stn?.OK_parts || store.get('okParts' + ele) || 0
      stn.shift = getShift.getShift() // 1, 2, 3
      stn.NOT_parts = stn?.NOT_parts || store.get('nokParts' + ele) || 0
      stn.Total_parts = stn.OK_parts+stn.NOT_parts//stn?.Total_parts || store.get('totalParts' + ele) || 0
      stn.Rej_Reason_1 = stn?.Rej_Reason_1 || 0
      stn.AlmWord_1 = stn?.AlmWord_1 || 0
      stn.AlmWord_2 = stn?.AlmWord_2 || 0
      stn.AlmWord_3 = stn?.AlmWord_3 || 0
      stn.theoretical_cycletime_LH = stn?.theoretical_cycletime_LH || 0
      stn.theoretical_cycletime_RH = stn?.theoretical_cycletime_RH || 0
      stn.actualCycletime_LH = stn?.actualCycletime_LH || 0
      stn.actualCycletime_RH = stn?.actualCycletime_RH || 0
      stn.theoretical_cycletime =
        stn?.theoretical_cycletime ||
        stn?.theoretical_cycletime_LH + stn?.theoretical_cycletime_RH ||
        0
      stn.actualCycletime =
        stn?.actualCycletime ||
        stn?.actualCycletime_LH + stn?.actualCycletime_RH ||
        0
      stn.operation_time = stn?.operation_time || stn.actualCycletime || 0


      // if (Number.isInteger(stn.OK_parts)) {
      //   store.set('okParts' + ele, stn.OK_parts)
      // }
      // if (Number.isInteger(stn.NOT_parts)) {
      //   store.set('nokParts' + ele, stn.NOT_parts)
      // }
      // if (Number.isInteger(stn.Total_parts)) {
      //   store.set('totalParts' + ele, stn.Total_parts)
      // }

      if (result == true) {
        rawCalc.plcvalues(stn, connection, ele)
        //cycleCalc.rawCycletime(stn, ele)
        criticalCalc.checkOperation(stn, ele)
        //alertCalc.AlertRawTable(stn, connection, ele)
        lossCalc.changedLoss(stn, ele)
        //alarmCalc.machineAlarm(stn, ele)
        //toolCalc.toolLife(stn, ele)
        //diagnosticCalc.checkConnection(connection, ele)
      } else if (!res.data || res.data == '') {
        //rawCtrl.connectionFalse(connection)
        // diagnosticCalc.checkConnection(connection, ele)
        console.log('Check PLC communication!!..')
      }
    })
  })
}

setInterval(valuesReady, settings.refresh_rate)



// function plc_disconnect_mail(plc) {

// console.log(plc);

// }