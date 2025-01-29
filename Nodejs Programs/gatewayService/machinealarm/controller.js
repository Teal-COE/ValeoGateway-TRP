var dbhero = require('../model_db')
const datalogger = require('../datalogger')

exports.alarmStartime = async function (alarm, start) {
    try {
        var alarmDB;
        const data = await dbhero.query(`select AlarmCode from hero.dbo.alarm_time where AlarmCode='${alarm}'`)
        if (data) {
            data[0]?.forEach(data => {
                alarmDB = data?.AlarmCode;
            })
            if (!alarmDB) {
                let sql = `insert into hero.dbo.alarm_time(AlarmCode,StartTime,status)values('${alarm}','${start}','true')`;
                dbhero.query(sql, (err, result) => {
                    if (err) {
                        datalogger.dataLog("MachineAlarm", "alarmStartime", "Machinecode", "alarm start time", err);
                    }
                });
            }
        }

    } catch (error) {
        datalogger.dataLog("MachineAlarm", "alarmStartime", "Machinecode", "alarm start time", error);
    }
}

exports.alarmDelete = async function (eliminate) {
    let eliminateElement = `delete from hero.dbo.alarm_time where AlarmCode='${eliminate}'`;
    dbhero.query(eliminateElement, (err, result) => {
    })
}

