import React from 'react';
//import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Title from '../Title';
import Dropdown from '../Dropdown';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// Generate Info Data
function createData(id, idText, label, value) {
  return { id, idText, label, value };
}

const rows = [
  createData(0, "name", 'Nombre del indicador', 'Estrellas de Millos'),
  createData(1, "definition", 'Definición del indicador', 'Campeonatos obtenidos por Millonarios FC'),
  createData(2, "periodicity", 'Periodicidad', 'Semestral'),
  createData(3, "dataSource", 'Origen o fuente de los datos', 'Esfuerzo Colectivo Albiazul'),
  createData(4, "formula", 'Fórmula', 'E=MC^2'),
  createData(5, "responsableData", 'Responsable de recolectar datos del indicador', 'Jorge Lizcano (Moneda)'),
  createData(6, "responsableIndicator", 'Responsable del indicador', 'Wuilker Fariñez'),
];

/*function preventDefault(event) {
  event.preventDefault();
}*/

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

const useStyles = makeStyles((theme) => ({
  thead: {
    fontWeight: "bold",
  },
  submit: {
    margin: theme.spacing(3, 2, 2),
  },
}));

export default function IndicatorInfo(props) {
  const classes = useStyles();
  const [state, setState] = React.useState({
    name: "",
    definition: "",
    periodicity: "",
    dataSource: "",
    formula: "",
    unit: "",
    responsableData: "",
    responsableIndicator: "",
    editing: false,
  });
  const handleClickEdit = () => {
    setState({
      editing: true,
    });
  }
  const handleClickSave = () => {
    for(let i = 0; i < rows.length; i++) {
      rows[i].value = state[rows[i].idText] ? state[rows[i].idText] : rows[i].value;
    }
    setState({
      editing: false,
    });
  }
  const handleClickCancel = () => {
    setState({
      editing: false,
    });
  }
  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  }
  return (
    <React.Fragment>
      <Title>Información del Indicador</Title>
      <Grid container spacing={3}>
        <Grid item xs>
          <Dropdown type="Servicio" options={options1} />
        </Grid>
        <Grid item xs>
          <Dropdown type="Indicador" options={options2} />
        </Grid>
      </Grid>
      <Table size="small">
        <TableBody>
          {rows.map((row,i) => (
            <TableRow key={row.id}>
              <TableCell className={classes.thead}>{row.label}</TableCell>
              <TableCell>
                {state.editing ? 
                  <TextField
                    variant="standard"
                    margin="normal"
                    fullWidth
                    id={rows[i].idText}
                    label={rows[i].label}
                    name={rows[i].idText}
                    value={state[rows[i].idText]}
                    autoComplete={rows[i].idText}
                    onChange={handleChange}
                    defaultValue={rows[i].value}
                    multiline
                  /> : 
                  row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Grid container spacing={3}>
        <Grid item xs>
          {
            props.admin ? state.editing ? 
            <div>
              <Button
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleClickSave}
              > Guardar </Button> 
              <Button
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleClickCancel}
              > Cancelar </Button> 
            </div> : 
            <Button
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleClickEdit}
            > Editar Indicador </Button> : 
            <span/>
          }
        </Grid>
      </Grid>
    </React.Fragment>
  );
}