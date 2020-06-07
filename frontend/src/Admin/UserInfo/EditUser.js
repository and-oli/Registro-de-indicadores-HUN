import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import Title from '../../Shared/Title';
import PermissionsConfig from './PermissionsConfig';
import AccessesConfig from './AccessesConfig';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const Fade = React.forwardRef(function Fade(props, ref) {
    const { in: open, children, onEnter, onExited, ...other } = props;
    const style = useSpring({
        from: { opacity: 0 },
        to: { opacity: open ? 1 : 0 },
        onStart: () => {
            if (open && onEnter) {
                onEnter();
            }
        },
        onRest: () => {
            if (!open && onExited) {
                onExited();
            }
        },
    });

    return (
        <animated.div ref={ref} style={style} {...other}>
            {children}
        </animated.div>
    );
});

Fade.propTypes = {
    children: PropTypes.element,
    in: PropTypes.bool.isRequired,
    onEnter: PropTypes.func,
    onExited: PropTypes.func,
};

export default function EditUser(props) {

    const classes = useStyles();
    const [message, setMessage] = React.useState({ color: "green", text: "" });
    const [loading, setLoading] = React.useState(false);
    const [done, setDone] = React.useState(false);
    const [accessesToDelete, setAccessesToDelete] = React.useState([]);

    const deleteAccess = (access) => {
        let newAccesses = [...accessesToDelete]
        newAccesses.push(access)
        setAccessesToDelete(newAccesses)
    }

    const accept = (selectedIndicators) => {
        setLoading(true)
        let newIndicatorPermissions = []
        let newUnitPerimssions = []
        for (let ind of selectedIndicators) {
            if (!props.currentUserPermissions.find(cup => cup.idUnidad === ind.idUnidad && cup.idIndicador === ind.idIndicador)) {
                if (ind.idIndicador === -1) {
                    newUnitPerimssions.push({ idUnidad: ind.idUnidad, idUsuario: props.currentUserId })
                } else {
                    newIndicatorPermissions.push({ idIndicador: ind.idIndicador, idUsuario: props.currentUserId })
                }
            }
        }
        let indicatorPermissionsToRemove = []
        let unitPerimssionsToRemove = []
        for (let perm of props.currentUserPermissions) {

            if (!selectedIndicators.find(ind => perm.idUnidad === ind.idUnidad && perm.idIndicador === ind.idIndicador)) {
                if (perm.idIndicador === -1) {
                    unitPerimssionsToRemove.push({ idUnidad: perm.idUnidad, idUsuario: props.currentUserId })
                } else {
                    indicatorPermissionsToRemove.push({ idIndicador: perm.idIndicador, idUsuario: props.currentUserId })
                }
            }
        }

        fetch("/permissions/addMultipleUserIndicatorPermissions/", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ list: newIndicatorPermissions })
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.success) {

                    fetch("/permissions/addMultipleUserUnitPermissions/", {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ list: newUnitPerimssions })
                    }).then((response) => response.json())
                        .then((responseJson) => {
                            if (responseJson.success) {

                                fetch("/permissions/removeMultipleUserIndicatorPermissions/", {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ list: indicatorPermissionsToRemove })
                                }).then((response) => response.json())
                                    .then((responseJson) => {
                                        if (responseJson.success) {

                                            fetch("/permissions/removeMultipleUserUnitPermissions/", {
                                                method: 'POST',
                                                headers: {
                                                    'Accept': 'application/json',
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({ list: unitPerimssionsToRemove })
                                            }).then((response) => response.json())
                                                .then((responseJson) => {
                                                    setLoading(false)
                                                    if (responseJson.success) {
                                                        fetch("/accesses/removeMultipleAccesses/", {
                                                            method: 'POST',
                                                            headers: {
                                                                'Accept': 'application/json',
                                                                'Content-Type': 'application/json',
                                                            },
                                                            body: JSON.stringify({ list: accessesToDelete.map(a => a.idAcceso) })
                                                        }).then((response) => response.json())
                                                            .then((responseJson) => {
                                                                setLoading(false)
                                                                if (responseJson.success) {
                                                                    setMessage({ color: "green", text: "Permisos modificados, refresque la aplicación" })
                                                                    setDone(true)
                                                                } else {
                                                                    setMessage({ color: "red", text: responseJson.message })
                                                                }
                                                            })
                                                    } else {
                                                        setMessage({ color: "red", text: responseJson.message })
                                                    }
                                                })

                                        } else {
                                            setMessage({ color: "red", text: responseJson.message })
                                        }
                                    })

                            } else {
                                setMessage({ color: "red", text: responseJson.message })
                            }
                        })
                } else {
                    setMessage({ color: "red", text: responseJson.message })
                }
            })
    }

    return (
        <Modal
            aria-labelledby="spring-modal-title"
            aria-describedby="spring-modal-description"
            className={classes.modal}
            open={props.open}
            onClose={() => props.handleEditUserModalOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >

            <Fade in={props.open}>
                {
                    loading ?
                        <div className="loader"></div> :
                        <div className={classes.paper}>
                            <Title>Editar permisos y accesos</Title>
                            {
                                !done && (
                                    <div>
                                        <AccessesConfig deleteAccess={deleteAccess} currentUserAccesses={props.currentUserAccesses} />
                                        <PermissionsConfig accept={accept} currentUserPermissions={props.currentUserPermissions} />
                                    </div>
                                )
                            }
                            <div style={{ color: message.color }}>
                                {message.text}
                            </div>
                        </div>
                }
            </Fade>
        </Modal>
    );
}