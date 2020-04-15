import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import { useSpring, animated } from 'react-spring/web.cjs'; // web.cjs is required for IE 11 support
import Title from '../../Shared/Title';
import Button from '@material-ui/core/Button';
import DateFnsUtils from '@date-io/date-fns';
import esLocale from 'date-fns/locale/es'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    //border: '2px solid #000',
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

export default function EnableAccess(props) {
  const classes = useStyles();
  const handleClick = () => {
    props.handleClose();
  }
  //const now = new Date(Date.now());
  //const date = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  //console.log(new Date(date));
  const [state, setSate] = React.useState({
    initDate: new Date(new Date()),
    endDate: new Date(new Date()),
  });

  const handleInitDateChange = (date) => {
    setSate({
      initDate: date,
    });
  };

  const handleEndDateChange = (date) => {
    setSate({
      endDate: date,
    });
  };

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
        <div className={classes.paper}>
          <Title>Habilitar Acceso</Title>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DatePicker
                  autoOk
                  variant="inline"
                  value={state.initDate}
                  label="Fecha desde"
                  onChange={handleInitDateChange}
                  format="dd/MM/yyyy"
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  autoOk
                  variant="inline"
                  value={state.endDate}
                  label="Fecha hasta"
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy"
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleClick}
              >
                Aceptar
              </Button>
        </div>
      </Fade>
    </Modal>
  );
}