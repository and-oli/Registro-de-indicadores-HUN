import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Title from '../Title';
import { TableRow, TableCell } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import esLocale from 'date-fns/locale/es'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

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

/*function preventDefault(event) {
  event.preventDefault();
}*/

const useStyles = makeStyles((theme) => ({
  depositContext: {
    flex: 1,
  },
  thead: {
    fontWeight: "bold",
    borderBottom: "none",
  },
  tcell: {
    borderBottom: "none",
  },
  table: {
    marginTop: theme.spacing(2),
  },
}));

export default function IndicatorByDate() {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  return (
    <React.Fragment>
      <Title>Información por Fecha</Title>
      <Grid container spacing={3}>
        <Grid item xs>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
            <DatePicker
              autoOk
              variant="inline"
              value={selectedDate}
              label="Fecha"
              onChange={handleDateChange}
              format="dd/MM/yyyy"
            />
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
      {/*<Typography component="p" variant="h4">
        $3,024.00
        </Typography>*/}
      {/*<Typography color="textSecondary" className={classes.depositContext}>
          on 15 March, 2019
        </Typography>*/}
      <Table className={classes.table} size="small">
        <TableBody>
        {labelCellPair.map((row) => (
          <TableRow key={row.id}>
            <TableCell className={classes.thead}>{row.label}</TableCell>
            <TableCell className={classes.tcell}>{row.value}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
        
      {/*<div>
        <Link color="primary" href="#" onClick={preventDefault}>
          Dejé este código para entender los hooks y tener un ejemplo
        </Link>
      </div>*/}
    </React.Fragment>
  );
}