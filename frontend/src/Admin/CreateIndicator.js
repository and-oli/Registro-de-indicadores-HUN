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
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import NewUnitModal from './NewUnitModal';
import DeleteUnitModal from './DeleteUnitModal';

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
  if (Number.parseInt(data['startCurrentPeriod']) > 28 || Number.parseInt(data['startCurrentPeriod']) < 1
    || Number.parseInt(data['endCurrentPeriod']) > 28 || Number.parseInt(data['endCurrentPeriod']) < 1) {
    return { message: "Los días del mes deben estar entre 1 y 28" }
  }
  if (Number.parseInt(data['startCurrentPeriod']) > Number.parseInt(data['endCurrentPeriod'])) {
    return { message: "La fecha de inicio debe ser anterior a la del fin de la vigencia." }
  }
  for (let key in data) {
    if (key === "startCurrentPeriod" && moment().isAfter(data["endCurrentPeriod"])) {

    }
    else if (!data[key]) {
      return true;
    }
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
  const [newUnitModalVisible, setNewUnitModalVisible] = React.useState(false);
  const [deleteUnitModalVisible, setDeleteUnitModalVisible] = React.useState(false);
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
    startCurrentPeriod: 1,
    endCurrentPeriod: 10,
  });

  const handleDateChange = (event) => {
    const start = event.target.name === "startCurrentPeriod" ? true : false;
    const date = (event.target.value);
    if (start) {
      setState({ ...state, startCurrentPeriod: date });
    } else {
      setState({ ...state, endCurrentPeriod: date });
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
    let validationResult = validateData(state)
    if (validationResult) {
      if (validationResult.message) {
        setMessage(validationResult.message);
      } else {
        setMessage("Ocurrío un error con el formato de los datos. Por favor asegúrese de haber ingresado todos los datos correctamente.");

      }
      setSuccess(false);
      setLoading(false);
      setOpen(true);
    } else {
      fetch("/indicators/", {
        method: "POST",
        body: JSON.stringify({ ...state, indicatorType }),
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
              <div style={{ position: "relative" }}>
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
                <AddCircleOutlineIcon
                  className="new-unit"
                  onClick={() => setNewUnitModalVisible(true)}
                />
                {
                  state.idUnit &&
                  <HighlightOffIcon
                    className="delete-unit"
                    onClick={() => setDeleteUnitModalVisible(true)}
                  />
                }
              </div>
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
                label="Inicio de la vigencia (día del mes)"
                defaultValue={1}
                name="startCurrentPeriod"
                autoComplete="startCurrentPeriod"
                type="number"
                onChange={handleDateChange}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="endCurrentPeriod"
                label="Fin de la vigencia (día del mes)"
                defaultValue={10}
                name="endCurrentPeriod"
                autoComplete="endCurrentPeriod"
                type="number"
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
      <NewUnitModal open={newUnitModalVisible} close={() => setNewUnitModalVisible(false)} />
      <DeleteUnitModal open={deleteUnitModalVisible} close={() => setDeleteUnitModalVisible(false)} unitId={state.idUnit} />
    </main>
  );
}
