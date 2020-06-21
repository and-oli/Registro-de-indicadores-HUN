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

    const accept = async (selectedIndicators) => {
        setLoading(true)
        let newIndicatorPermissions = []
        let newIndicatorReadPermissions = []
        let newUnitPermissions = []
        let newUnitReadPermissions = []
        for (let ind of selectedIndicators) {
            if (!props.currentUserPermissions.find(cup => cup.uniqueId === ind.uniqueId)) {
                if (ind.idIndicador === -1) {
                    if (ind.edit) {
                        newUnitPermissions.push({ idUnidad: ind.idUnidad, idUsuario: props.currentUserId })
                    } else {
                        newUnitReadPermissions.push({ idUnidad: ind.idUnidad, idUsuario: props.currentUserId })
                    }
                } else {
                    if (ind.edit) {
                        newIndicatorPermissions.push({ idIndicador: ind.idIndicador, idUsuario: props.currentUserId })
                    } else {
                        newIndicatorReadPermissions.push({ idIndicador: ind.idIndicador, idUsuario: props.currentUserId })
                    }
                }
            }
        }
        let indicatorPermissionsToRemove = []
        let indicatorReadPermissionsToRemove = []
        let unitPermissionsToRemove = []
        let unitReadPermissionsToRemove = []

        for (let perm of props.currentUserPermissions) {
            if (!selectedIndicators.find(ind => perm.uniqueId === ind.uniqueId)) {
                if (perm.idIndicador === -1) {
                    if (perm.edit) {
                        unitPermissionsToRemove.push({ idUnidad: perm.idUnidad, idUsuario: props.currentUserId })
                    } else {
                        unitReadPermissionsToRemove.push({ idUnidad: perm.idUnidad, idUsuario: props.currentUserId })
                    }
                } else {
                    if (perm.edit) {
                        indicatorPermissionsToRemove.push({ idIndicador: perm.idIndicador, idUsuario: props.currentUserId })
                    } else {
                        indicatorReadPermissionsToRemove.push({ idIndicador: perm.idIndicador, idUsuario: props.currentUserId })
                    }
                }
            }
        }
        let permissionsData = [
            {
                route: "/permissions/addMultipleUserIndicatorPermissions/",
                list: newIndicatorPermissions
            },
            {
                route: "/permissions/addMultipleUserUnitPermissions/",
                list: newUnitPermissions
            },
            {
                route: "/permissions/removeMultipleUserIndicatorPermissions/",
                list: indicatorPermissionsToRemove
            },
            {
                route: "/permissions/removeMultipleUserUnitPermissions/",
                list: unitPermissionsToRemove
            },
            {
                route: "/permissions/addMultipleUserIndicatorReadPermissions/",
                list: newIndicatorReadPermissions
            },
            {
                route: "/permissions/addMultipleUserUnitReadPermissions/",
                list: newUnitReadPermissions
            },
            {
                route: "/permissions/removeMultipleUserIndicatorReadPermissions/",
                list: indicatorReadPermissionsToRemove
            },
            {
                route: "/permissions/removeMultipleUserUnitReadPermissions/",
                list: unitReadPermissionsToRemove
            },
            {
                route: "/accesses/removeMultipleAccesses/",
                list: accessesToDelete.map(a => a.idAcceso)
            },
        ]

        let response;
        for (let permission of permissionsData) {
            response = await (await fetch(permission.route, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ list: permission.list })
            })).json()

            if (!response.success) {
                setMessage({ color: "red", text: response.message });
                break;
            }
        }
        setLoading(false)
        if (response.success) {
            setMessage({ color: "green", text: "Permisos modificados, refresque la aplicación" })
            setDone(true)
        }

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