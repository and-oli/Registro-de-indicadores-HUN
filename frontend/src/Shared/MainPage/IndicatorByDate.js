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

const camelToText = function (camel) {
  let text = camel.replace(/([A-Z])/g, " $1");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function IndicatorByDate(props) {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [currentRecord, setCurrentRecord] = React.useState(null);
  const [records, setRecords] = React.useState([]);

  React.useEffect(
    () => {
      if (props.records.length > 0) {
        setRecords(props.records.map(r => {
          let date = new Date(r.fecha);
          let rClone = JSON.parse(JSON.stringify(r))
          delete rClone.fecha;
          delete rClone.idRegistro;
          delete rClone.idSolicitud;
          delete rClone.idIndicador;
          delete rClone.idUsuario;
          delete rClone.periodo;
          delete rClone.ultimoDelPeriodo;
          return {
            fecha: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
            ...rClone
          }
        })
        )
        let d = new Date(selectedDate);
        let dateString = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
        console.log(dateString, records)
        setCurrentRecord(records.find(r => r.fecha === dateString))
      }
    }, [props]
  )
  const handleDateChange = (date) => {
    let d = new Date(date);
    let dateString = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    setSelectedDate(date);
    console.log(date)
    setCurrentRecord(records.find(r => r.fecha === dateString))
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
      <Table className={classes.table} size="small">
        <TableBody>
          {
            currentRecord ?
              Object.keys(currentRecord).map((k, i) => (
                <TableRow key={i}>
                  <TableCell className={classes.thead}>{camelToText(k)}</TableCell>
                  <TableCell className={classes.tcell}>{currentRecord[k]}</TableCell>
                </TableRow>
              )) :
              <div>No hay registros para este indicador en esta fecha</div>
          }
        </TableBody>
      </Table>
    </React.Fragment>
  );
}