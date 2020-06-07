import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../Shared/Title';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import moment from 'moment';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Checkbox from '@material-ui/core/Checkbox';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const validateData = (data) => {
  for (let key in data) {
    if (key === "startCurrentPeriod" && (moment(data[key]).isAfter(data["endCurrentPeriod"]) || moment(data[key]).isBefore(moment.now()))) return true
    else if (!data[key]) return true;
  }
  return false;
}

const camelToText = function (camel) {
  let text = camel.replace(/([A-Z])/g, "$1");
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}



export default function CreateIndicador() {
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
          } else if (status === 403) {
            localStorage.removeItem("HUNToken");
            window.location.reload();
          }
        });
      fetch("/indicators/periods/all", {
        method: "GET",
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => { status = response.status; return response.json() })
        .then((responseJson) => {
          setLoading(false);
          if (responseJson.success) {
            setPeriods(responseJson.periodos);
          } else if (status === 403) {
            localStorage.removeItem("HUNToken");
            window.location.reload();
          }
        });
    }, []
  );

  const [loading, setLoading] = React.useState(false);
  const [units, setUnits] = React.useState([]);
  const [periods, setPeriods] = React.useState([]);
  //Snack attributes:
  const [success, setSuccess] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [indicatorType, setIndicatorType] = React.useState(false);
  const [state, setState] = React.useState({
    name: "",
    definition: "",
    idPeriod: "",
    idUnit: "",
    dataSource: "",
    formula: "",
    unitMeasurement: "",
    responsableData: "",
    responsableIndicator: "",
    goal: "",
    startCurrentPeriod: "",
    endCurrentPeriod: "",
  });

  const handleDateChange = (event) => {
    const start = event.target.name === "startCurrentPeriod" ? true : false;
    const date = moment(event.target.value);
    if (date.date() > 28) {
      setMessage("El día del mes debe ser entre 1 y 28");
      setSuccess(false);
      setOpen(true);
    }
    if (start) {
      if ((state.endCurrentPeriod && date.isBefore(state.endCurrentPeriod)) || !state.endCurrentPeriod) {
        state.startCurrentPeriod = date;
        setState(state);
      } else {
        setMessage("La fecha de inicio debe ser anterior a la fecha de finalización.");
        setSuccess(false);
        setOpen(true);
      }
    } else {
      if ((state.startCurrentPeriod && date.isAfter(state.startCurrentPeriod)) || !state.startCurrentPeriod) {
        state.endCurrentPeriod = date;
        setState(state);
      } else {
        setMessage("La fecha de finalización debe ser posterior a la fecha de inicio.");
        setSuccess(false);
        setOpen(true);
      }
    }
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };
  const handleTypeChange = (e) => {
    setIndicatorType(e.target.checked)
  }
  const handleClick = (event) => {
    event.preventDefault();
    let status;
    setLoading(true);
    if (validateData(state)) {
      setMessage("Ocurrío un error con el formato de los datos. Por favor asegúrese de haber ingresado todos los datos correctamente.");
      setSuccess(false);
      setLoading(false);
      setOpen(true);
    } else {
      fetch("/indicators/", {
        method: "POST",
        body: JSON.stringify({...state, indicatorType}),
        headers: {
          'x-access-token': localStorage.getItem("HUNToken"),
          'Content-Type': 'application/json',
        },
      }).then((response) => { status = response.status; return response.json() })
        .then((responseJson) => {
          setLoading(false);
          setMessage(responseJson.message);
          setSuccess(responseJson.success);
          if (responseJson.success) {
            setOpen(true);
            window.location.reload();
          } else if (status === 403) {
            setOpen(true);
            localStorage.removeItem("HUNToken");
            window.location.reload();
          } else {
            setOpen(true);
          }
        });
    }
  };

  const classes = useStyles();
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper className={classes.paper}>
            <Title>Nuevo Indicador</Title>

            <form className={classes.root} noValidate autoComplete="off">
              <TextField
                margin="normal"
                required
                id="idUnit"
                label="Unidad"
                name="idUnit"
                autoComplete="idUnit"
                onChange={handleChange}
                select
                value={state.idUnit}
                SelectProps={{ native: true }}
                autoFocus
              >
                <option aria-label="None" value="" />
                {
                  units.map((option) => (
                    <option key={option.nombre} value={option.idUnidad}>{option.nombre}</option>
                  ))
                }
              </TextField>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="name"
                label="Nombre del indicador"
                name="name"
                autoComplete="name"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="definition"
                label="Definición del indicador"
                name="definition"
                autoComplete="definition"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="idPeriod"
                label="Periodicidad"
                name="idPeriod"
                autoComplete="idPeriod"
                onChange={handleChange}
                select
                value={state.idPeriod}
                SelectProps={{ native: true }}
              >
                <option aria-label="None" value="" />
                {
                  periods.map((option) => (
                    <option key={option.nombre} value={option.idPeriodo}>{camelToText(option.nombre)}</option>
                  ))
                }
              </TextField>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="dataSource"
                label="Origen o fuente de los datos"
                name="dataSource"
                autoComplete="dataSource"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="formula"
                label="Fórmula"
                name="formula"
                autoComplete="formula"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="unitMeasurement"
                label="Unidad de medición"
                name="unitMeasurement"
                autoComplete="unitMeasurement"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="responsableData"
                label="Responsable de recolectar datos del indicador"
                name="responsableData"
                autoComplete="responsableData"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="responsableIndicator"
                label="Responsable del indicador"
                name="responsableIndicator"
                autoComplete="responsableIndicator"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="goal"
                label="Meta"
                name="goal"
                autoComplete="goal"
                type="number"
                onChange={handleChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="startCurrentPeriod"
                label="Fecha inicio de la primera vigencia"
                defaultValue={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth() + 1}-${new Date().getDate() < 10 ? "0" + (new Date().getDate()) : new Date().getDate()}`}
                name="startCurrentPeriod"
                autoComplete="startCurrentPeriod"
                type="date"
                onChange={handleDateChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="endCurrentPeriod"
                label="Fecha fin de la primera vigencia"
                defaultValue={`${new Date().getFullYear()}-${new Date().getMonth() + 1 < 10 ? "0" + (new Date().getMonth() + 1) : new Date().getMonth() + 1}-${new Date().getDate() < 10 ? "0" + (new Date().getDate()) : new Date().getDate()}`}
                name="endCurrentPeriod"
                autoComplete="endCurrentPeriod"
                type="date"
                onChange={handleDateChange}
              />
              <div>

                <Checkbox
                  checked={indicatorType}
                  onChange={handleTypeChange}
                  color="primary"
                  inputProps={{ 'aria-label': 'Requiere numerador y denominador' }}
                />
                Requiere numerador y denominador
                </div>
              {
                loading ?
                  <div className="loader"></div> :
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    onClick={handleClick}
                  >
                    Aceptar
                </Button>
              }
            </form>
          </Paper>
        </React.Fragment>
      </Container>
      <Snackbar open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        key={'top,center'}
      >
        <Alert onClose={handleClose} severity={success ? "success" : "error"}>
          {message}
        </Alert>
      </Snackbar>
    </main>
  );
}
