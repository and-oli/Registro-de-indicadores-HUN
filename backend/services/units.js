
module.exports = {

    getUnits: async function (dbCon) {
        const result = (await dbCon.request()
            .query('select * from UNIDADES')).recordset;
        return result;
    },
    getUnitByName: async function (dbCon, nombre) {
        const result = await dbCon.query`
            select * from UNIDADES 
            where nombre = ${nombre}
        `;
        return result.recordset[0];
    },
    postUnit: async function (dbCon, unit) {
        const result = await dbCon.query`
        insert into UNIDADES (nombre)
        values (${unit.nombre})`;
        return result.rowsAffected > 0
    }

}