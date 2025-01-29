var db = require('../model_db')
var dbhero = require('../model_db')
const datalogger = require('../datalogger')
const stn_setting = require('../configuration/stn1_settings.json')

exports.toolCounting = async function (toolID, toolCount, Machinecode, timeStamp) {
    // var checkstatus;
    // const result = await db.query(`select status from tool_life where ToolID='${toolID}'`)
    //     result[0]?.forEach(element => {
    //         checkstatus = element?.status
    //     });
    //     if (checkstatus == "true") {
    //         let Sql = `UPDATE tool_life SET CurrentLifeCycle='${toolCount}' where ToolID='${toolID}' AND status='true' `;
    //         db.query(Sql, (err, result) => {
    //             if (err) {
    //                 datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment updating", err);
    //             }
    //         });

    //         // let sqlhero = `UPDATE hero.dbo.tbl_Raw_Toollife SET CurrentLifeCycle='${toolCount}' where ToolID='${toolID}`;
    //         // dbhero.query(sqlhero, (err, result) => {
    //         //     if (err) {
    //         //         datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment logging", err);
    //         //     }
    //         // });
    //     }
    //     else {


    //         let sql = `insert into tool_life(Linecode,Machinecode,ToolID,Classification,CurrentLifeCycle,Timestamp,Companycode,Plantcode,Date,status)values('${stn_setting.line_code}','${Machinecode}','${toolID}','${stn_setting.classification}','${toolCount}','${timeStamp}','${stn_setting.company_code}','${stn_setting.plant_code}','${date}','true')`;
    //         db.query(sql, (err, result) => {
    //             if (err) {
    //                 datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment logging", err);
    //             }
    //         });

    //         // let sqlhero = `insert into hero.dbo.tbl_Raw_Toollife(Line_Code,Machine_Code,ToolID,Classification,CurrentLifeCycle,Time_Stamp,CompanyCode,PlantCode,Date)values('${stn_setting.line_code}','${Machinecode}','${toolID}','${stn_setting.classification}','${toolCount}','${timeStamp}','${stn_setting.company_code}','${stn_setting.plant_code}','')`;
    //         // dbhero.query(sqlhero, (err, result) => {
    //         //     if (err) {
    //         //         datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment logging", err);
    //         //     }
    //         // });
    //     }

    var checkstatustool;
    const resulttool = await db.query(`SELECT Machine_Code FROM hero.dbo.tbl_Raw_Toollife where ToolID='${toolID}'`)
    resulttool[0]?.forEach(element => {
        checkstatustool = element?.Machine_Code
    });
    if (checkstatustool) {
        let sqlhero = `UPDATE hero.dbo.tbl_Raw_Toollife SET Machine_Code = 'M${Machinecode}', CurrentLifeCycle='${toolCount}', Time_Stamp = '${timeStamp}' where ToolID='${toolID}'`;
        dbhero.query(sqlhero, (err, result) => {
            if (err) {
                datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment logging", err);
            }
        });
        console.log('Updated tool data logged!!')
    }
    else {
        let sqlhero = `insert into hero.dbo.tbl_Raw_Toollife(Line_Code,Machine_Code,ToolID,Classification,CurrentLifeCycle,Time_Stamp,CompanyCode,PlantCode,Date)values('${stn_setting.line_code}','M${Machinecode}','${toolID}','${stn_setting.classification}','${toolCount}','${timeStamp}','${stn_setting.company_code}','${stn_setting.plant_code}','')`;
        dbhero.query(sqlhero, (err, result) => {
            if (err) {
                datalogger.dataLog("Tool Life", "toolCounting", Machinecode, " tool increment logging", err);
            }
        });
        console.log('toolCounting tool data logged!!')
    }
}
