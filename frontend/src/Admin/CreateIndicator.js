import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../Shared/Title';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

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

export default function CreateIndicador() {
  const [state, setState] = React.useState({
    name: "",
    definition: "",
    periodicity: "",
    dataSource: "",
    formula: "",
    unit: "",
    responsableData: "",
    responsableIndicator: "",
  });

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleClick = () => {
    alert(state.name);
  }

  const classes = useStyles();

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper className={classes.paper}>
            <Title>Nuevo Indicador</Title>
            <Typography color="textSecondary">
              Falta dropdown del servicio
            </Typography>
            <form className={classes.root} noValidate autoComplete="off">
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
              autoFocus
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
                id="periodicity"
                label="Periodicidad"
                name="periodicity"
                autoComplete="periodicity"
                onChange={handleChange}
              />
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
                id="unit"
                label="Unindad de medición"
                name="unit"
                autoComplete="unit"
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleClick}
              >
                Aceptar
              </Button>
            </form> 
          </Paper>
        </React.Fragment>
      </Container>
    </main>
  );
}
