import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Modal } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import esLocale from 'date-fns/locale/es'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import Title from '../../Shared/Title';

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
    submit: {
      margin: theme.spacing(3, 0, 0),
    },
}));

export default function EnableAccess(props) {
    const classes = useStyles();
    const [modalStyle] = React.useState(getModalStyle);
    const [message, setMessage] = React.useState({ color: "green", text: "" });
    const [loading, setLoading] = React.useState(false);

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

    const handleClick = () => {
      props.setOpen(false);
    }

    const confirmEdit = function () {
        setLoading(true)
        fetch("/indicators/", {
            method: 'PUT',
            headers: {
                'x-access-token': localStorage.getItem("HUNToken"),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(props.indicator)
        }).then((response) => response.json())
            .then((responseJson) => {
                setLoading(false)
                if (responseJson.success) {
                    setMessage({text:responseJson.message, color:"green"})
                    props.confirmEdit()
                } else{
                    setMessage({text:responseJson.message, color:"red"})
                }
            })
    }
    const body = (
      <div className={classes.paper} style={modalStyle}>
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
      <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleClick}
          >
            Aceptar
          </Button>
      </Grid>
    </div>
    );

    return (
        <Modal
            open={props.open}
            onClose={() => props.setOpen(false)}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
        >
            {body}
        </Modal>
    );
}