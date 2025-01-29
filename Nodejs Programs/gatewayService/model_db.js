const { type } = require("os");

const { Sequelize } = require("sequelize");

// const db = new Sequelize("GATEWAYDB", "BPATEAL", "TEAL@2024!", {
//   host: '10.79.3.34',
//   port: 3534,
//   connectionTimeout:15000,
//   dialect: 'mssql',
//   dialectOptions: {
//     options: {
      
//       //trustedConnection: true,
//       //trustServerCertificate: true,
//       encrypt: false,
//     },
//     //HE6EDEVSQL03P
//   },
//   timezone: "5:30",
//   logging: false,
// });



exports.dbhero = new Sequelize("iotkpi", "sa", "teal@123", {
  host: '192.168.1.250',
  port:3534,
  connectionTimeout:15000,
  dialect: 'mssql',
  dialectOptions: {
    options: {
      //trustedConnection: true,
      //trustServerCertificate: true,
      encrypt: false,
    },
  },
  timezone: "5:30",
  logging: false,
});

//module.exports = db;

const sql = require('mssql');

const config = {
  user: 'a-sqltitan',
  password: 'p$05msb0QVII1KR',
  server: '10.231.4.104', 
  database: 'IOT_IGSA01',
  options: {
    encrypt: true, // for Azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
};

async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to MSSQL');
  } catch (err) {
    console.error('Database connection failed: ', err);
  }
}

connectToDatabase();

