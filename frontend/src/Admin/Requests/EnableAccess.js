import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Modal } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import esLocale from 'date-fns/locale/es'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import Title from '../../Shared/Title';
import MuiAlert from '@material-ui/lab/Alert';
import moment from 'moment';
import Snackbar from '@material-ui/core/Snackbar';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
        width: "50%",
        textAlign: "center",
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
    submit: {
      margin: theme.spacing(3, 1.5, 0),
    },
}));

export default function EnableAccess(props) {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [open, setOpen] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [message, setMessage] = React.useState("");

    const [initDate, setInintDate] = React.useState(new Date());
    const [endDate, setEndDate] = React.useState(new Date());

    const handleInitDateChange = (date) => {
      setInintDate(date);
    };
  
    const handleEndDateChange = (date) => {
      setEndDate(date);
    };


    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setOpen(false);
    };

    const confirmAccess = function (event,approved) {
        event.preventDefault();
        const approve = approved ? "approve" : "reject";
        const method = approved ? 'POST' : 'PUT';
        const baseURL = approved ? '/accesses/' : `/requests/${approve}/${props.user.idSolicitud}/`;
        const canFetch = approved ? moment(initDate).isBefore(endDate) && moment(endDate).isAfter(moment.now()) : true;
        if(canFetch) {
          fetch(baseURL, {
              method: method,
              headers: {
                'x-access-token': localStorage.getItem("HUNToken"),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                idUsuario: props.user.idUsuario, 
                idIndicador: props.user.idIndicador[0], 
                idSolicitud: props.user.idSolicitud, 
                fechaInicio: initDate,
                fechaFin: endDate,
              })
          }).then((response) => response.json())
              .then((responseJson) => {
                  setSuccess(responseJson.success);
                  if (responseJson.success) {
                      setMessage(approve ? "Acceso concedido exitosamennte" : "Acceso negado exitosamente");
                      setOpen(true);
                      props.closeModal();
                      window.location.reload();
                  } else{
                    setMessage(responseJson.message);
                    setOpen(true);
                  }
              });
        } else {
          setSuccess(false);
          setMessage("Revise que las fechas sean consistentes.");
          setOpen(true);
        }
    }
    const bodyApprove = (
      <div className={classes.paper} style={modalStyle}>
      <Title>Habilitar Acceso</Title>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DatePicker
              autoOk
              variant="inline"
              value={initDate}
              label="Fecha desde"
              onChange={handleInitDateChange}
              format="dd/MM/yyyy"
            />
          </Grid>
          <Grid item xs={12}>
            <DatePicker
              autoOk
              variant="inline"
              value={endDate}
              label="Fecha hasta"
              onChange={handleEndDateChange}
              format="dd/MM/yyyy"
            />
          </Grid>
        </Grid>
      </MuiPickersUtilsProvider>
      <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={(event) => confirmAccess(event,true)}
          >
            Aceptar
          </Button>
      </Grid>
    </div>
    );

    const bodyReject = (
      <div className={classes.paper} style={modalStyle}>
      <Title>Negar Acceso</Title>
        {props.user ? <Alert severity="warning">¿Está seguro que desea negar el acceso del indicador {props.user.nombre[1]} al usuario {`${props.user.nombre[0]} ${props.user.apellidos}`}?</Alert> : <div/>}
      <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={(event) => confirmAccess(event,false)}
          >
            Aceptar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={() => props.closeModal()}
          >
            Cancelar
          </Button>
      </Grid>
    </div>
    );

    return (
      <>
        <Modal
            open={props.open}
            onClose={() => props.closeModal()}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            {props.approve ? bodyApprove : bodyReject}
        </Modal>
        <Snackbar open={open} 
        autoHideDuration={6000} 
        onClose={handleClose} 
        anchorOrigin={{vertical: 'top', horizontal: 'center' }}
        key={'top,center'}
      >
        <Alert onClose={handleClose} severity={success?"success":"error"}>
          {message}
        </Alert>
      </Snackbar>
      </>
    );
}