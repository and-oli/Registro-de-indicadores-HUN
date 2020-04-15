async function db (){
    const sql = require("mssql");
    const dbConfig = require("./config.js").mssqlConfig;
    const pool = new sql.ConnectionPool(dbConfig);
    const poolConnect = await pool.connect();
    pool.on('error', err => {
        console.error(err)
    })
    return poolConnect;
}
module.exports = db; 