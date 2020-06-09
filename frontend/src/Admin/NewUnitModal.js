import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { Modal } from '@material-ui/core';

function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: 'absolute',
        width: "30%",
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function NewUnitModal(props) {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [message, setMessage] = React.useState({ color: "green", text: "" });
    const [newUnitName, setNewUnitName] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const confirmSubmit = function () {
        if (newUnitName.trim()) {
            setLoading(true)
            setMessage({ color: "green", text: "" });
            fetch("/units/", {
                method: 'POST',
                headers: {
                    'x-access-token': localStorage.getItem("HUNToken"),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({nombre: newUnitName.trim()})
            }).then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false)
                    if (responseJson.success) {
                        setMessage({ text: responseJson.message, color: "green" })
                    } else {
                        setMessage({ text: responseJson.message, color: "red" })
                    }
                })
        } else{
            setMessage({ color: "red", text: "Ingrese un nombre de unidad." });
        }
    }
    const body = (
        <div style={modalStyle} className={classes.paper}>
            <div>Agregar nueva unidad</div>
            {
                loading ?
                    <div className="loader"></div> :
                    <div style={{ margin: "30px" }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="unitName"
                            label="Nombre de la nueva unidad"
                            name="unitName"
                            onChange={(event)=>{setNewUnitName(event.target.value)}}
                        />
                        <Button
                            onClick={confirmSubmit}
                        >
                            Guardar
                         </Button>
                        <Button
                            onClick={props.close}
                        >
                            Cancelar
                         </Button>
                        <div style={{ color: message.color }}>{message.text}</div>
                    </div>
            }
        </div>
    );

    return (
        <Modal
            open={props.open}
            onClose={props.close}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            {body}
        </Modal>
    );
}