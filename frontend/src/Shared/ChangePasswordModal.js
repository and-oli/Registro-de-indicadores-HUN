import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Modal } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

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

export default function ChangePassword(props) {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [message, setMessage] = React.useState({ color: "green", text: "" });
    const [state, setState] = React.useState({ currentPassword: "", newPassword: "" });
    const [loading, setLoading] = React.useState(false);
    const confirmSubmit = function () {
        setMessage({ color: "green", text: "" });
        if (state.newPassword.length > 5) {

            setLoading(true)
            setMessage({ color: "green", text: "" });
            fetch("/users/changePassword", {
                method: 'POST',
                headers: {
                    'x-access-token': localStorage.getItem("HUNToken"),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state)
            }).then((response) => response.json())
                .then((responseJson) => {
                    setLoading(false)
                    if (responseJson.success) {
                        setMessage({ text: responseJson.message, color: "green" })
                    } else {
                        setMessage({ text: responseJson.message, color: "red" })
                    }
                })
        } else {
            setMessage({ color: "red", text: "La contraseña debe tener al menos 6 caracteres." });

        }
    }
    const handleChange = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value,
        });
    };

    const body = (
        <div style={modalStyle} className={classes.paper}>
            <div>Cambiar contraseña</div>
            {
                loading ?
                    <div className="loader"></div> :
                    <div style={{ margin: "30px" }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="currentPassword"
                            label="Contraseña actual"
                            name="currentPassword"
                            onChange={handleChange}
                            type="password"
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            type="password"
                            required
                            fullWidth
                            id="newPassword"
                            label="Contraseña nueva"
                            name="newPassword"
                            onChange={handleChange}
                        />
                        <Button
                            onClick={confirmSubmit}
                        >
                            Cambiar contraseña
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