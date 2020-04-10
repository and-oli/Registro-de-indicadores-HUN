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
    paddingTop: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  checkboxSpacer: {
    marginTop: theme.spacing(2),
  },
  textFieldSpacer: {
    marginLeft: theme.spacing(5),
  },
}));

const options1 = [
  'Servicio 1',
  'Servicio 2',
  'Servicio 3',
  'Servicio 4',
  'Servicio 5',
];

const options2 = [
  'Indicador 1',
  'Indicador 2',
  'Indicador 3',
  'Indicador 4',
  'Indicador 5',
];

export default function RegisterIndicator() {
  const classes = useStyles();
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

  const handleClick = () => {
    alert(state.analysis);
  }

  const handleCheck = (event) => {
    setState({
      checked: event.target.checked
    })
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>Registrar Indicador</Title>
            <Grid
              container
              direction="column"
              justify="space-evenly"
              alignItems="center"
            >
              <form className={classes.root} noValidate autoComplete="off">
                <Grid container spacing={3}>
                  <Grid item xs>
                    <Dropdown type="Servicio" options={options1} />
                  </Grid>
                  <Grid item xs>
                    <Dropdown type="Indicador" options={options2} />
                  </Grid>
                </Grid>
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
                    onClick={handleClick}
                  >
                    Enviar
                  </Button>
                </Grid>
              </form>
            </Grid>
          </Paper>
        </React.Fragment>
      </Container>
    </main>
  );
}