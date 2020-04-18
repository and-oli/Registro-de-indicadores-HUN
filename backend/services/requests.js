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
        const state = approved ? "APROBADA" : "RECHAZADA"
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

    requestExists: async function (dbCon, request) {
        const {
            idSolicitante,
            idAdministrador,
            idIndicador,
            fechaInicio,
            fechaFin
        } = request;
        const result = await dbCon.query`
            select fechaInicio, fechaFin from SOLICITUDES 
            where idSolicitante = ${idSolicitante}
            and idAdministrador = ${idAdministrador}
            and idIndicador = ${idIndicador}
                `;

        for (let resultItem of result.recordset) {
            const currentRequestInitialTime = new Date(resultItem.fechaInicio).getTime();
            const currentRequestEndTime = new Date(resultItem.fechaFin).getTime();
            const initialTime = new Date(fechaInicio).getTime();
            const endTime = new Date(fechaFin).getTime();
            if (initialTime >= currentRequestInitialTime && initialTime <= currentRequestEndTime ||
                endTime >= currentRequestInitialTime && endTime <= currentRequestEndTime) {
                return resultItem;
            }
        }
        return false;
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
        const requestIsInDb = await this.requestExists(dbCon, request)
        if (!requestIsInDb) {
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
            return {
                success: true,
                message: "Solicitud registrada!"
            }
        }
        else return {
            success: false,
            message: `Usted ya había ingresado una solicitud para este indicador en las fechas ${requestIsInDb.fechaInicio} y ${requestIsInDb.fechaFin}. `
        }
    }


}