import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import Title from '../../Shared/Title';
import PermissionsConfig from './PermissionsConfig';
import TextField from '@material-ui/core/TextField';

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

export default function NewUser(props) {

  const classes = useStyles();
  const [state, setState] = React.useState({
    name: "",
    username: "",
    lastName: "",
  });
  const [message, setMessage] = React.useState({ color: "green", text: "" });
  const [loading, setLoading] = React.useState(false);

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };


  const accept = (selectedIndicators) => {
    setLoading(true)
    let data = {
      username: state.username,
      nombre: state.name,
      apellidos: state.lastName,
      password: state.username, // De manera temporal se le asigna la cédula como contraseña
      permissions: selectedIndicators,
    }
    console.log(data)
    fetch("/users/", {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        if (responseJson.success) {

          setMessage({ color: "green", text: responseJson.message })
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
      onClose={props.handleClose}
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
              <Title>Nuevo Usuario</Title>
              <form className={classes.root} noValidate autoComplete="off">
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Nombre"
                  name="name"
                  autoComplete="name"
                  onChange={handleChange}
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="lastName"
                  label="Apellidos"
                  name="lastName"
                  autoComplete="lastName"
                  onChange={handleChange}
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  type="number"
                  required
                  fullWidth
                  id="username"
                  label="Cédula"
                  name="username"
                  autoComplete="username"
                  onChange={handleChange}
                />
                <PermissionsConfig accept={accept} />
                <div style={{ color: message.color }}>
                  {message.text}
                </div>
              </form>
            </div>
        }
      </Fade>
    </Modal>
  );
}