import React from 'react';
import Button from '@material-ui/core/Button';
import Dropdown from '../../Shared/Dropdown';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
}));

export default function PermissionsConfig(props) {
    const classes = useStyles();
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
    const [selectedIndicator, setSelectedIndicator] = React.useState(null);

    const handleUnitChange = (newUnit) => {
        let currentUnit = units.find(u => u.nombre === newUnit);
        if (currentUnit) {
            setLoading(true)
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
                        let indicatorsEditPermissions = responseJson.indicadores.map((i, j) => {
                            let object = { ...i, edit: true, uniqueId: i.idIndicador >= 0 ? (i.idIndicador + "e") : ("u" + i.idUnidad + "e") };
                            object.nombre = `${i.nombre} (edición)`;
                            return object
                        })
                        let indicatorsReadPermissions = responseJson.indicadores.map((i, j) => {
                            let object = { ...i, edit: false, uniqueId: i.idIndicador >= 0 ? (i.idIndicador + "r") : ("u" + i.idUnidad + "r") };
                            object.nombre = `${i.nombre} (lectura)`;
                            return object
                        })
                        let allPermissions = [...indicatorsEditPermissions, ...indicatorsReadPermissions]
                        allPermissions.sort((a, b) => {
                            if (a.nombre.includes("TODOS")) { return 1; }
                            if (b.nombre.includes("TODOS")) { return -1; }
                            if (a.nombre < b.nombre) { return -1; }
                            if (a.nombre > b.nombre) { return 1; }
                            return 0;
                        })
                        setIndicators(allPermissions)
                    }
                })
        }
    }
    const removeIndicatorFromSelectedList = (indicator) => {
        let values = [...selectedIndicators]
        let siIndex = selectedIndicators.findIndex(
            si => si.uniqueId === indicator.uniqueId
        )
        if (siIndex >= 0) {
            values.splice(siIndex, 1);
            setSelectedIndicators(values);
        }
    }
    const handleIndicatorSelection = (event) => {
        let currentIndicatorUniqueId = event.target.value;
        let currentIndicator = indicators.find(u => u.uniqueId === currentIndicatorUniqueId);
        setSelectedIndicator(currentIndicator)
        if (currentIndicator) {
            if (selectedIndicators.findIndex(
                si => si.uniqueId === currentIndicator.uniqueId
            ) < 0) {
                let values = [...selectedIndicators]
                let unitEditIndex = selectedIndicators.findIndex(u => u.idIndicador === -1 && u.idUnidad === currentIndicator.idUnidad && u.edit);
                let unitReadIndex = selectedIndicators.findIndex(u => u.idIndicador === -1 && u.idUnidad === currentIndicator.idUnidad && !u.edit);
                if (currentIndicator.idIndicador !== -1) { // Se seleccionó un indicador
                    if (unitEditIndex >= 0) { // La edición de la  unidad del indicador seleccionado estaba presente en la selección previa
                        values.splice(unitEditIndex, 1); // Se elimina la edición de la unidad (siempre se elimina cuando se escoge el permiso de un indicador)
                    }
                    let indicatorReadIndex = values.findIndex(u => u.idIndicador === currentIndicator.idIndicador && !u.edit);
                    if (currentIndicator.edit && indicatorReadIndex >= 0) {  // Se seleccionó el permiso de edición del indicador y se había seleccionado el de lectura previamente
                        values.splice(indicatorReadIndex, 1); // Se elimina la lectura del indicador
                    }

                    if (!currentIndicator.edit) { // Se seleccionó el permiso de lectura del indicador
                        let indicatorEditIndex = values.findIndex(u => u.idIndicador === currentIndicator.idIndicador && u.edit);
                        if (indicatorEditIndex >= 0) {  // Se había seleccionado la edición del indicador previamente
                            values.splice(indicatorEditIndex, 1); // Se elimina la edición del indicador
                        }
                        unitReadIndex = values.findIndex(u => u.idIndicador === -1 && u.idUnidad === currentIndicator.idUnidad && !u.edit);
                        if (unitReadIndex >= 0) {  // Se había seleccionado la lectura de la unidad previamente
                            values.splice(unitReadIndex, 1); // Se elimina la lectura de la unidad
                        }
                    }
                    values.push(currentIndicator) // Se agrega el indicador
                    setSelectedIndicators(values)
                } else { // Se seleccionó una unidad
                    let newSelection;
                    if (currentIndicator.edit) { // Se seleccionó la edición de la unidad
                        if (unitReadIndex >= 0) { // Se había seleccionado la lectura de la unidad
                            values.splice(unitReadIndex, 1); // Se elimina la lectura de la unidad
                        }
                        newSelection = values.filter(i => i.idUnidad !== currentIndicator.idUnidad); // Se eliminan todos los indicadores de la unidad seleccionada
                    } else { // Se seleccionó la lectura de la unidad
                        if (unitEditIndex >= 0) { // La edición de la  unidad del indicador seleccionado estaba presente en la selección previa
                            values.splice(unitEditIndex, 1); // Se elimina la edición de la unidad
                        }
                        newSelection = values.filter(i => i.idUnidad !== currentIndicator.idUnidad || i.edit); // Se eliminan todos los indicadores de lectura de la unidad seleccionada
                    }
                    newSelection.push(currentIndicator); // Se agrega la unidad
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
                        <FormControl required variant={props.variant ? props.variant : "standard"} className={classes.formControl}>
                            <InputLabel htmlFor="dropdown">Indicador</InputLabel>
                            <Select
                                native
                                value={selectedIndicator ? selectedIndicator.uniqueId : ""}
                                onChange={handleIndicatorSelection}
                                label="Indicador"
                            >
                                <option aria-label="None" value={null} />
                                {
                                    indicators.map((u, i) =>
                                        <option key={i} value={u.uniqueId}>{u.nombre} </option>
                                    )
                                }
                            </Select>
                        </FormControl>
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