module.exports = {

    getRequestsByUser: async function (dbCon, idUsuario) {
        const result = await dbCon.query`
            select *  from SOLICITUDES 
            where idSolicitante = ${idUsuario}
        `;
        return result.recordset;
    },

    getRequestsToUser: async function (dbCon, idUsuario) {
        const result = await dbCon.query`
            select *  from SOLICITUDES 
            where idAdministrador = ${idUsuario}
        `;
        return result.recordset;
    },
    updateRequest: async function (dbCon, idSolicitud, approved) {
        const state = approved? "APROBADA":"RECHAZADA"
        const idEstado = (await dbCon.query`
        select idEstado from estados 
        where nombre = ${state}
        `).recordset[0].idEstado;

        const result = await dbCon.query`
            update SOLICITUDES
            set idEstado = ${idEstado}
            where idSolicitud = ${idSolicitud}
        `;
        return result.recordset;
    },

    postRequest: async function (dbCon, request) {
        const {
            idSolicitante, 
            idAdministrador,
            idIndicador, 
            fechaInicio, 
            fechaFin, 
            comentario, 
        } = request;

        const idEstado = (await dbCon.query`
        select idEstado from estados 
        where nombre = 'EN ESPERA'
        `).recordset[0].idEstado;

        const result = await dbCon.query`
            insert into SOLICITUDES (
                idSolicitante, 
                idAdministrador,
                idIndicador, 
                idEstado, 
                fechaInicio, 
                fechaFin, 
                comentario
                )
            values (
                ${idSolicitante},
                ${idAdministrador},
                ${idIndicador},
                ${idEstado},
                ${fechaInicio},
                ${fechaFin},
                ${comentario}
                )`;
        return result.rowsAffected > 0
    },

}