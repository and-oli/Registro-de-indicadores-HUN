import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Title from '../Title';
import { TableRow, TableCell } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Dropdown from '../Dropdown';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';


const mapMonths = {
  "1": "Enero",
  "2": "Febrero",
  "3": "Marzo",
  "4": "Abril",
  "5": "Mayo",
  "6": "Junio",
  "7": "Julio",
  "8": "Agosto",
  "9": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
}

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


const AntSwitch = withStyles((theme) => ({
  root: {
    width: 42,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    color: theme.palette.grey[500],
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
        //borderColor: theme.palette.primary.main,
        border: 'none',
      },
      '&$focusVisible $thumb': {
        color: theme.palette.primary.main,
        border: '6px solid #fff',
      },
    },
  },
  thumb: {
    width: 24,
    height: 24,
    //boxShadow: 'none',
  },
  track: {
    border: `1px solid ${theme.palette.grey[400]}`,
    borderRadius: 26 / 2,
    opacity: 1,
    backgroundColor: theme.palette.grey[50],
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
}))(Switch);

export default function IndicatorByDate(props) {
  const classes = useStyles();
  const [currentRecords, setCurrentRecords] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [dates, setDates] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [all, setAll] = React.useState(false);
  //const [placedPeriods, setPlacedPeriods] = React.useState(new Set());

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
                return {
                  fecha: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                  ...rClone
                }
              }).sort((a,b) => b.periodo - a.periodo)
              );
            }
            getDates();
          })
    }, [props]
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
        if (responseJson.success) {
          setDates(responseJson.dates)
        }
      })
  }

  function handlePeriodChange(periodText) {
    if(periodText) {
      let currentPeriod = dates.find(d =>
        `${d.startDate} - ${d.endDate}` === periodText
      ).period
      setCurrentRecords(
        records.filter(r => r.periodo === currentPeriod)
      )
    } else {
      setCurrentRecords([]);
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSwitchChange = () => {
    setAll(!all);
  }

  let placedPeriods = new Set();

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
                  type="Filtrar por periodo"
                  options={dates.map(d => `${d.startDate} - ${d.endDate}`)}
                  handleDropdownChange={handlePeriodChange}
                />
              </Grid>
            </Grid>
            {
              currentRecords[0] ?
                currentRecords.map((cr, j) => {
                  return <Table key={cr.fecha + j} className={classes.table} size="small">
                    <TableBody className="registry-by-date">
                      {
                        Object.keys(cr).map((k, i) => {
                          if (k !== "periodo") {
                            return (
                              <TableRow key={"filtered" + i + "" + j}>
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
                /*<div>
                  No hay registros para este indicador en este periodo
                </div>*/
                
                <div>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography component="div">
                        <Grid component="label" container alignItems="center" spacing={1}>
                          <Grid item>Todos los registros</Grid>
                          <Grid item>
                            <AntSwitch checked={all} onChange={handleSwitchChange}/>
                          </Grid>
                          <Grid item>Último del periodo</Grid>
                        </Grid>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <TablePagination
                        component="div"
                        count={records.length}
                        page={page}
                        onChangePage={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        labelRowsPerPage="Registros por página"
                        rowsPerPageOptions={[10, 25, 50, 100, records.length].sort((a,b) => a-b)}
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                      />
                    </Grid>
                  </Grid>
                {records.filter(r => !all ? true : r.ultimoDelPeriodo).map((r, i) => {
                  let title = false;
                  if(!placedPeriods.has(r.periodo)) {
                    placedPeriods.add(r.periodo);
                    title = true;
                  }
                    return <div key={i + r.fecha} >
                    {title ?  <Title> {`${mapMonths[r.fecha.split("/")[1]]} de ${r.fecha.split("/")[2]}`} </Title> : ""}
                    <Table className={classes.table} size="small">
                    <TableBody className="registry-by-date">
                      {
                        Object.keys(r).map((k, j) => {
                          if (k !== "periodo") {
                            return (
                              <TableRow key={i + "" + j}>
                                <TableCell className={classes.thead}>{camelToText(k)}</TableCell>
                                <TableCell className={classes.tcell}>{r[k]}</TableCell>
                              </TableRow>
                            )
                          }
                        })
                      }
                    </TableBody>
                  </Table>
                  </div>
                }).filter((_,i) => i >= page*rowsPerPage && i < (page+1)*rowsPerPage )}
                </div>
            }
          </div>
      }

    </React.Fragment>
  );
}