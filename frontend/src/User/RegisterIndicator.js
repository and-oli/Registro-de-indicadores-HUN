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
  const [unit, setUnit] = React.useState(null);
  const [indicator, setIndicator] = React.useState(null);
  const [units, setUnits] = React.useState([]);
  const [indicators, setIndicators] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [currentPeriod, setCurrentPeriod] = React.useState("");
  const [nextPeriod, setNextPeriod] = React.useState("");
  const [registerForNextPeriod, setRegisterForNextPeriod] = React.useState(false);
  const [currentPeriodNumber, setCurrentPeriodNumber] = React.useState(null);
  const [message, setMessage] = React.useState({ color: "green", text: "" });

  const [state, setState] = React.useState({
    analysis: "",
    improvement: "",
    checked: false,
    numerator: "",
    denominator: "",
    result: "",
  });

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleCheck = (event) => {
    setState({
      checked: event.target.checked
    })
  }
  const handleUnitChange = (newUnit) => {
    let currentUnit = units.find(u => u.nombre === newUnit);
    if (currentUnit) {
      setUnit(currentUnit)
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
            if (responseJson.result) {
              getPeriodDates(currentIndicator.idIndicador)
            } else {
              setLoading(false)
            }
          }
        })
    }
  }
  const getPeriodDates = (idIndicador) => {
    fetch(`/indicators/currentAndNextPeriodDates/${idIndicador}`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem("HUNToken")
      },
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        if (responseJson.success) {
          let { currentStartDate,
            currentEndDate,
            nextStartDate,
            nextEndDate
          } = responseJson.nextPeriod
          setCurrentPeriod(`${currentStartDate} - ${currentEndDate}`)
          setCurrentPeriodNumber(responseJson.nextPeriod.currentPeriod)
          let time1 = new Date(nextStartDate).getTime()
          let time2 = new Date(nextEndDate).getTime()
          let currentTime = new Date().getTime()
          let newPeriodOption = currentTime >= time1 && currentTime <= time2;
          setNextPeriod(newPeriodOption ? `${nextStartDate} - ${nextEndDate}` : null);
        }
      })
  }

  function handleCurrentPeriodChecked() {
    setRegisterForNextPeriod(false)
  }
  function handleNextPeriodChecked() {
    setRegisterForNextPeriod(true)
  }


  const submit = () => {
    setMessage({ color: "green", text: "" })
    if (
      state.analysis.trim() !== "" &&
      state.numerator.trim() !== "" &&
      state.denominator.trim() !== "" &&
      state.result.trim() !== "" &&
      (state.improvement.trim() !== "" || !state.checked)
    ) {
      setLoading(true)
      let data = {
        idIndicador: indicator.idIndicador,
        analisisCualitativo: state.analysis.trim(),
        accionMejora: state.checked ? state.improvement.trim() : "",
        valor: state.result,
        numerador: state.numerator,
        denominador: state.denominator,
        periodo: registerForNextPeriod ? currentPeriodNumber + 1 : currentPeriodNumber,
        nuevoPeriodo: registerForNextPeriod,
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
            setMessage({ color: "green", text: responseJson.message })
          } else {
            setMessage({ color: "red", text: responseJson.message })
          }
        })
    }
    else {
      setMessage({ color: "red", text: "Ingrese todos los datos" })
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
                    <AccessDenied /> :
                    indicator &&
                    <Grid
                      container
                      direction="column"
                      justify="space-evenly"
                      alignItems="center"
                    >
                      <Grid item xs>

                        <Checkbox
                          className={classes.checkboxSpacer}
                          checked={!registerForNextPeriod}
                          onChange={handleCurrentPeriodChecked}
                          color="primary"
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                        />
                        Registro para el periodo {currentPeriod}
                      </Grid>
                      {
                        nextPeriod &&
                        <Grid item xs>
                          <Checkbox
                            className={classes.checkboxSpacer}
                            checked={registerForNextPeriod}
                            onChange={handleNextPeriodChecked}
                            color="primary"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                          />
                        Registro para el periodo {nextPeriod}
                        </Grid>
                      }
                      <Grid item xs>
                        <TextField
                          className={classes.textFieldSpacer}
                          variant="outlined"
                          margin="normal"
                          required
                          id="analysis"
                          label="Analísis Cualitativo"
                          name="analysis"
                          autoComplete="analysis"
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
                              name="numerator"
                              autoComplete="numerator"
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              variant="outlined"
                              margin="normal"
                              required
                              id="denominator"
                              type="number"
                              label="Denominador"
                              name="denominator"
                              autoComplete="denominator"
                              onChange={handleChange}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <TextField
                              variant="outlined"
                              margin="normal"
                              required
                              id="result"
                              type="number"
                              label="Resultado"
                              name="result"
                              autoComplete="result"
                              onChange={handleChange}
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