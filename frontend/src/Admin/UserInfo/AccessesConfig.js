import React from 'react';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export default function PermissionsConfig(props) {
    React.useEffect(() => {
        setCurrentUserAccesses([...props.currentUserAccesses])
    }, []
    );
    const [currentUserAccesses, setCurrentUserAccesses] = React.useState([]);

    const deleteAccess = (acc) => {
        props.deleteAccess(acc)
        let accessesTemp = [...currentUserAccesses]
        accessesTemp.splice(accessesTemp.findIndex(at => at.idAcceso === acc.idAcceso), 1)
        setCurrentUserAccesses(accessesTemp);
    }

    return (
        <div style={{ border: "solid #d2d2d2 1px", borderRadius: "5px", padding: "10px" }}>
            <span style={{ color: "#3f51b5" }}>
                Accesos temporales del usuario del usuario
            </span>
            {
                currentUserAccesses.map((acc, i) => (
                    <div key={i} className="selected-indicator">
                        {`${acc.nombreIndicadorDelAcceso} (${acc.nombreUnidadDelAccesoAlIndicador})
                          ${acc.fechaInicioAccesoIndicador.split("T")[0]} - ${acc.fechaFinAccesoIndicador.split("T")[0]}
                        `}
                        <HighlightOffIcon
                            className="highlight-off-icon"
                            onClick={() => deleteAccess(acc)} />
                    </div>)
                )
            }
        </div>
    );
}