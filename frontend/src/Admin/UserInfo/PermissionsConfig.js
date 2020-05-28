import React from 'react';
import Button from '@material-ui/core/Button';
import Dropdown from '../../Shared/Dropdown';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

export default function PermissionsConfig(props) {
    React.useEffect(
        () => {
            let status;
            fetch("/units/", {
                method: 'GET',
                headers: {
                    'x-access-token': localStorage.getItem("HUNToken")
                },
            }).then((response) => { status = response.status; return response.json(); })
                .then((responseJson) => {
                    setLoading(false)
                    if (responseJson.success) {
                        setUnits(responseJson.unidades)
                        setSelectedIndicators([...props.currentUserPermissions])
                    } else if (status === 403) {
                        localStorage.removeItem("HUNToken");
                        window.location.reload();
                    }
                })
        }, [props.currentUserPermissions]
    );
    const [units, setUnits] = React.useState([]);
    const [indicators, setIndicators] = React.useState([]);
    const [selectedIndicators, setSelectedIndicators] = React.useState([]);
    const [loading, setLoading] = React.useState(false);


    const handleUnitChange = (newUnit) => {
        let currentUnit = units.find(u => u.nombre === newUnit);
        setLoading(true)
        if (currentUnit) {
            fetch(`/indicators/names/${currentUnit.idUnidad}`, {
                method: 'GET',
                headers: {
                    'x-access-token': localStorage.getItem("HUNToken")
                },
            }).then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false)
                    if (responseJson.success) {
                        responseJson.indicadores.push({ nombre: `TODOS (${newUnit})`, idIndicador: -1, idUnidad: currentUnit.idUnidad })
                        setIndicators(responseJson.indicadores)
                    }
                })
        }
    }
    const removeIndicatorFromSelectedList = (indicator) => {
        let values = [...selectedIndicators]
        let siIndex = selectedIndicators.findIndex(
            si => si.idIndicador === indicator.idIndicador && si.idUnidad === indicator.idUnidad
        )
        if (siIndex >= 0) {
            values.splice(siIndex, 1);
            setSelectedIndicators(values);
        }
    }
    const handleIndicatorSelection = (newIndicator) => {
        let currentIndicator = indicators.find(u => u.nombre === newIndicator);
        if (currentIndicator) {
            if (selectedIndicators.findIndex(
                si => si.idIndicador === currentIndicator.idIndicador && si.idUnidad === currentIndicator.idUnidad
            ) < 0) {
                let values = [...selectedIndicators]
                if (currentIndicator.idIndicador !== -1) {
                    let todosIndex = selectedIndicators.findIndex(u => u.idIndicador === -1 && u.idUnidad === currentIndicator.idUnidad);
                    if (todosIndex >= 0) {
                        values.splice(todosIndex, 1);
                        values.push(currentIndicator);
                        setSelectedIndicators(values)
                    } else {
                        values.push(currentIndicator)
                        setSelectedIndicators(values)
                    }
                } else {
                    let newSelection = values.filter(i => i.idUnidad !== currentIndicator.idUnidad);
                    newSelection.push(currentIndicator);
                    setSelectedIndicators(newSelection)
                }
            }

        }
    }

    return (
        <div style={{ border: "solid #d2d2d2 1px", borderRadius: "5px", padding: "10px" }}>
            <span style={{ color: "#3f51b5" }}>
                Permisos del usuario
            </span>
            {
                selectedIndicators.map((si, i) => (
                    <div key={i} className="selected-indicator">
                        {si.nombre}
                        <HighlightOffIcon
                            className="highlight-off-icon"
                            onClick={() => removeIndicatorFromSelectedList(si)} />
                    </div>)
                )
            }
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <Dropdown type="Unidad" options={units.map(u => u.nombre)} handleDropdownChange={handleUnitChange} />
                {
                    loading ?
                        <div className="loader"></div> :
                        <Dropdown type="Indicador" options={indicators.map(u => u.nombre)} handleDropdownChange={handleIndicatorSelection} />
                }
            </div>
            <div style={{ textAlign: "center" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => props.accept(selectedIndicators)}
                >
                    Aceptar
            </Button>
            </div>
        </div>
    );
}