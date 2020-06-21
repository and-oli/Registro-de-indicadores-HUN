import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Title from '../Title';
import { TableRow, TableCell } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import TablePagination from '@material-ui/core/TablePagination';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import periodsOrder from '../../PeriodsOrder';


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
  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [last, setLast] = React.useState(false);
  const [periods, setPeriods] = React.useState([]);

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
            let currentPeriods = []
            responseJson.registros.forEach(element => {
              if (currentPeriods.findIndex(cp => cp.name === element.nombrePeriodo && cp.year === element.ano) < 0) {
                currentPeriods.push({ name: element.nombrePeriodo, year: element.ano })
              }
            });
            currentPeriods.sort((a, b) => {
              if (a.year === b.year) {
                return periodsOrder[props.periodicity][b.name] - periodsOrder[props.periodicity][a.name]
              }
              return b.year - a.year
            })
            setPeriods(currentPeriods)
            setRecords(responseJson.registros.map(r => {
              let rClone = JSON.parse(JSON.stringify(r))
              delete rClone.idRegistro;
              delete rClone.idSolicitud;
              delete rClone.idIndicador;
              delete rClone.idUsuario;
              return rClone;
            })
            );
            setLoading(false)
          }
        })
    }, [props]
  )


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSwitchChange = () => {
    setLast(!last);
  }
  const renderRecords = (period) => {
    let recordsToRender = [...records]
    recordsToRender.sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    })
    return recordsToRender.filter(r => (r.ultimoDelPeriodo || !last) && r.nombrePeriodo === period.name && r.ano === period.year)
      .map((r, i) => {
        return (
          <Table className={classes.table} size="small">
            <TableBody className="registry-by-date">
              {
                Object.keys(r).map((k, j) => {
                  if (k !== "ultimoDelPeriodo") {
                    return (
                      <TableRow key={i + "" + j}>
                        <TableCell className={classes.thead}>{k === "ano" ? "Año" : camelToText(k)}</TableCell>
                        <TableCell className={classes.tcell}>{r[k]}</TableCell>
                      </TableRow>
                    )
                  }
                })
              }
            </TableBody>
          </Table>
        )
      })
  }

  return (
    <React.Fragment>
      {
        loading ?
          <div className="loader"></div> :
          <div>
            <Title>Información por Fecha</Title>
            {
              !records[0] ?
                <div>
                  No hay registros para este indicador todavía
              </div>
                :
                <div>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography component="div">
                        <Grid component="label" container alignItems="center" spacing={1}>
                          <Grid item>Todos los registros</Grid>
                          <Grid item>
                            <AntSwitch checked={last} onChange={handleSwitchChange} />
                          </Grid>
                          <Grid item>Último del periodo</Grid>
                        </Grid>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <TablePagination
                        component="div"
                        count={periods.length}
                        page={page}
                        onChangePage={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onChangeRowsPerPage={handleChangeRowsPerPage}
                        labelRowsPerPage="Periodos por página"
                        rowsPerPageOptions={[10, 25, 50, 100, periods.length].sort((a, b) => a - b)}
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                      />
                    </Grid>
                  </Grid>
                  {
                    periods.map((period, i) => {
                      return (
                        <div key={i}>
                          <Title> {`${period.name} de ${period.year}`} </Title>
                          {
                            renderRecords(period)
                          }
                        </div>
                      )
                    }).filter((_, i) => i >= page * rowsPerPage && i < (page + 1) * rowsPerPage)
                  }
                </div>
            }
          </div>
      }
    </React.Fragment>
  );
}