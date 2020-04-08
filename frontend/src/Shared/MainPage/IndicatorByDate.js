import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Title from './Title';
import { TableRow, TableCell } from '@material-ui/core';

// Generate Indicator Data
function createData(id, label, value) {
  return { id, label, value };
}

const labelCellPair = [
  createData(0, 'Valor:', 15),
  createData(1, 'Usuario:', 'Benito Camelas'),
  createData(2, 'Análisis cualitativo:', 'Millos necesita más estrellas'),
  createData(3, 'Acción de mejora:', 'Cambiar directivas'),
];

function preventDefault(event) {
  event.preventDefault();
}

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  thead: {
    fontWeight: "bold",
    borderBottom: "none",
  },
  table: {
    borderBottom: "none",
  },
});

export default function IndicatorByDate() {
  const classes = useStyles();
  return (
    <React.Fragment>
      <Title>Información por Fecha</Title>
      <Typography color="textSecondary" className={classes.depositContext}>
        Falta dropdown de la fecha
      </Typography>
      {/*<Typography component="p" variant="h4">
        $3,024.00
        </Typography>*/}
      {/*<Typography color="textSecondary" className={classes.depositContext}>
          on 15 March, 2019
        </Typography>*/}
        <Table size="small">
          <TableBody>
          {labelCellPair.map((row) => (
            <TableRow key={row.id}>
              <TableCell className={classes.thead}>{row.label}</TableCell>
              <TableCell className={classes.table}>{row.value}</TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      <div>
        <Link color="primary" href="#" onClick={preventDefault}>
          Dejé este código para entender los hooks y tener un ejemplo
        </Link>
      </div>
    </React.Fragment>
  );
}