import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../Shared/Title';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Dropdown from '../Shared/Dropdown';
import AccessDenied from './AccessDenied';

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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxSpacer: {
    marginTop: theme.spacing(2),
  },
  textFieldSpacer: {
    marginLeft: theme.spacing(5),
  },
}));

export default function RegisterIndicator() {
  const classes = useStyles();

  React.useEffect(
    () => {
      setLoading(true)
      fetch("/units/", {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setUnits(responseJson.unidades)
          }
        })
    }, []
  )
  const [userIsAllowed, setUserIsAllowed] = React.useState(false);
  const [indicator, setIndicator] = React.useState(null);
  const [units, setUnits] = React.useState([]);
  const [indicators, setIndicators] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPeriod, setCurrentPeriod] = React.useState("");
  const [message, setMessage] = React.useState({ color: "green", text: "" });
  const [accessMessage, setAccessMessage] = React.useState( "No tiene permiso para editar este indicador en este momento");
  const [result, setResult] = React.useState("");
  const [idAcceso, setIdAcceso] = React.useState(null);

  const [state, setState] = React.useState({
    analysis: "",
    improvement: "",
    checked: false,
    numerator: "",
    denominator: "",
  });

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };
  const calculateResult = (event) => {
    let numerator = event.target.name === "numerator" ? Number.parseFloat(event.target.value) : state.numerator ? state.numerator : 0;
    let denominator = event.target.name === "denominator" ? Number.parseFloat(event.target.value) : state.denominator ? state.denominator : null;

    if (indicator) {
      if (indicator.tipo && numerator && denominator) {
        setResult(numerator / denominator)
      } else if (!indicator.tipo && numerator) {
        setResult(numerator)
      }
    }
  }
  const handleCheck = (event) => {
    setState({
      ...state,
      checked: event.target.checked
    })
  }
  const handleUnitChange = (newUnit) => {
    let currentUnit = units.find(u => u.nombre === newUnit);
    if (currentUnit) {
      setIndicator(null)
      fetch(`/indicators/names/${currentUnit.idUnidad}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setIndicators(responseJson.indicadores)
          }
        })
    }
  }

  const handleIndicatorChange = (newIndicator) => {
    let currentIndicator = indicators.find(u => u.nombre === newIndicator);
    if (currentIndicator) {
      setLoading(true)
      setIndicator(currentIndicator)
      fetch(`/records/userCanPostRecord/${currentIndicator.idIndicador}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.success) {
            setUserIsAllowed(!!responseJson.result)
            if(responseJson.accessMessage){
              setAccessMessage(responseJson.accessMessage)
            }
            if (responseJson.result) {
              setMessage({ color: "green", text: "" });
              setIdAcceso(responseJson.result.idAcceso)
              getCurrentPeriod(currentIndicator.idIndicador)
            } else {
              setLoading(false)
            }
          }
        })
    }
  }


  const getCurrentPeriod = (idIndicador) => {
    fetch(`/indicators/currentPeriodName/${idIndicador}`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem("HUNToken")
      },
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        if (responseJson.success) {
          setCurrentPeriod(responseJson.currentPeriod)
        }
      })
  }


  const submit = (e) => {
    e.preventDefault()
    setMessage({ color: "green", text: "" })
    if (
      state.analysis.trim() !== "" &&
      state.numerator.trim() !== "" &&
      Number.parseFloat(state.numerator.trim()) > 0 &&
      ((state.denominator.trim() !== "" && Number.parseFloat(state.denominator.trim()) > 0) || !indicator.tipo) &&
      (state.improvement.trim() !== "" || !state.checked)
    ) {
      setLoading(true)
      let data = {
        idIndicador: indicator.idIndicador,
        analisisCualitativo: state.analysis.trim(),
        accionMejora: state.checked ? state.improvement.trim() : "",
        valor: indicator.tipo ? (Number.parseFloat(result) * 100) : result,
        numerador: state.numerator,
        denominador: indicator.tipo ? state.denominator : 0,
        ano: currentPeriod.year,
        nombrePeriodo: currentPeriod.name,
        idAcceso
      }
      fetch("/records/", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token': localStorage.getItem("HUNToken")
        },
        body: JSON.stringify(data)
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setState({
              analysis: "",
              improvement: "",
              checked: false,
              numerator: "",
              denominator: ""
            })
            setMessage({ color: "green", text: responseJson.message })
          } else {
            setMessage({ color: "red", text: responseJson.message })
          }
        })
    }
    else {
      setMessage({ color: "red", text: "Ingrese todos los datos correctamente" })
    }

  }


  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper className={classes.paper}>
            <Title>Registrar valor de indicador</Title>
            <form className={classes.root} noValidate autoComplete="off"
              onSubmit={submit}
            >
              <Grid
                container
                direction="column"
                justify="space-evenly"
                alignItems="center"
              >
                <Grid container spacing={3}>
                  <Grid item xs>
                    <Dropdown type="Servicio" options={units.map(u => u.nombre)} handleDropdownChange={handleUnitChange} />
                  </Grid>
                  <Grid item xs>
                    <Dropdown type="Indicador" options={indicators.map(u => u.nombre)} handleDropdownChange={handleIndicatorChange} />
                  </Grid>
                </Grid>
              </Grid>
              {
                loading ?
                  <div className="loader"></div> :
                  indicator && !userIsAllowed ?
                    <AccessDenied indicatorId={indicator.idIndicador} message={accessMessage}/> :
                    indicator &&
                    <Grid
                      container
                      direction="column"
                      justify="space-evenly"
                      alignItems="center"
                    >
                      <Grid item xs>
                        Registro para el periodo {currentPeriod.name} {currentPeriod.year}
                      </Grid>
                      <Grid item xs>
                        <TextField
                          className={classes.textFieldSpacer}
                          variant="outlined"
                          margin="normal"
                          required
                          id="analysis"
                          label="Análisis Cualitativo"
                          value={state.analysis}
                          name="analysis"
                          autoComplete="analysis"
                          multiline
                          rowsMax={7}
                          onChange={handleChange}
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs>
                        <Checkbox
                          className={classes.checkboxSpacer}
                          checked={state.checked}
                          onChange={handleCheck}
                          color="primary"
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                        <TextField
                          variant="outlined"
                          margin="normal"
                          id="improvement"
                          label="Requiere mejora"
                          name="improvement"
                          autoComplete="improvement"
                          multiline
                          value={state.improvement}
                          rowsMax={7}
                          onChange={handleChange}
                          disabled={!state.checked}
                        />
                      </Grid>
                      <Grid item xs >
                        <Grid container alignItems="center" spacing={3}>
                          <Grid item xs={3} >
                            <Typography color="textSecondary" className={classes.paper}>
                              Dato mes del indicador
                      </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              variant="outlined"
                              margin="normal"
                              required
                              id="numerator"
                              label="Numerador"
                              type="number"
                              value={state.numerator}
                              name="numerator"
                              autoComplete="numerator"
                              onChange={(event) => { handleChange(event); calculateResult(event); }}
                            />
                          </Grid>
                          {
                            indicator.tipo &&
                            <Grid item xs={3}>
                              <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                id="denominator"
                                type="number"
                                value={state.denominator}
                                label="Denominador"
                                name="denominator"
                                autoComplete="denominator"
                                onChange={(event) => { handleChange(event); calculateResult(event); }}
                              />
                            </Grid>
                          }
                          <Grid item xs={3}>
                            <TextField
                              variant="outlined"
                              margin="normal"
                              required
                              disabled
                              id="result"
                              type="number"
                              label="Resultado"
                              name="result"
                              autoComplete="result"
                              onChange={handleChange}
                              value={result}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          className={classes.submit}
                          onClick={submit}
                        >
                          Enviar
                        </Button>
                        <div style={{ color: message.color }}>{message.text}</div>
                      </Grid>
                    </Grid>
              }
            </form>
          </Paper>
        </React.Fragment>
      </Container>
    </main>
  );
}