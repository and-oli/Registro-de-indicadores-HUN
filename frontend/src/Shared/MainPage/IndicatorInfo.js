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

// Generate Info Data
function createData(id, label, value) {
  return { id, label, value };
}

const rows = [
  createData(0, 'Nombre del indicador', 'Estrellas de Millos'),
  createData(1, 'Definición del indicador', 'Campeonatos obtenidos por Millonarios FC'),
  createData(2, 'Periodicidad', 'Semestral'),
  createData(3, 'Origen o fuente de los datos', 'Esfuerzo Colectivo Albiazul'),
  createData(4, 'Fórmula', 'E=MC^2'),
  createData(5, 'Responsable de recolectar datos del indicador', 'Jorge Lizcano (Moneda)'),
  createData(6, 'Responsable del indicador', 'Wuilker Fariñez'),
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
}));

export default function IndicatorInfo() {
  const classes = useStyles();
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
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className={classes.thead}>{row.label}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </React.Fragment>
  );
}