import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Title from '../Title';
import { TableRow, TableCell } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Dropdown from '../Dropdown';


const useStyles = makeStyles((theme) => ({
  depositContext: {
    flex: 1,
  },
  thead: {
    fontWeight: "bold",
    borderBottom: "none",
    width: "200px",
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
  const [currentRecords, setCurrentRecords] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [dates, setDates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(
    () => {
        setLoading(true)
        fetch(`/records/recordsByIndicatorId/${props.indicatorId}`, {
          method: 'GET',
          headers: {
            'x-access-token': localStorage.getItem("HUNToken")
          },
        }).then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.success) {
              setRecords(responseJson.registros.map(r => {
                let date = new Date(r.fecha);
                let rClone = JSON.parse(JSON.stringify(r))
                delete rClone.fecha;
                delete rClone.idRegistro;
                delete rClone.idSolicitud;
                delete rClone.idIndicador;
                delete rClone.idUsuario;
                delete rClone.ultimoDelPeriodo;
                return {
                  fecha: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                  ...rClone
                }
              })
              )
            }
            getDates();
          })
    }, []
  )

  function getDates() {
    fetch(`/indicators/pastPeriodsDates/${props.indicatorId}`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem("HUNToken")
      },
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        console.log(responseJson)
        if (responseJson.success) {
          setDates(responseJson.dates)
        }
      })
  }

  function handlePeriodChange(periodText) {
    let currentPeriod = dates.find(d =>
      `${d.startDate} - ${d.endDate}` === periodText
    ).period
    setCurrentRecords(
      records.filter(r => r.periodo === currentPeriod)
    )
  }
  return (
    <React.Fragment>
      {
        loading ?
          <div className="loader"></div> :
          <div>
            <Title>Información por Fecha</Title>
            <Grid container spacing={3}>
              <Grid item xs>
                <Dropdown
                  type="Periodo"
                  options={dates.map(d => `${d.startDate} - ${d.endDate}`)}
                  handleDropdownChange={handlePeriodChange}
                />
              </Grid>
            </Grid>
            {
              currentRecords[0] ?
                currentRecords.map((cr, j) => {
                  return <Table className={classes.table} size="small">
                    <TableBody style ={{border: "solid #d2d2d2 1px"}}>
                      {
                        Object.keys(cr).map((k, i) => {
                          if (k !== "periodo") {
                            return (
                              <TableRow key={i + "" + j}>
                                <TableCell className={classes.thead}>{camelToText(k)}</TableCell>
                                <TableCell className={classes.tcell}>{cr[k]}</TableCell>
                              </TableRow>
                            )
                          }
                        })
                      }
                    </TableBody>
                  </Table>
                }) :
                <div>
                  No hay registros para este indicador en este periodo
                </div>
            }
          </div>
      }

    </React.Fragment>
  );
}