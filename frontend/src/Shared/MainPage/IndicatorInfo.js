import React from 'react';
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
import UpdateIndicatorModal from './UpdateIndicatorModal';

const useStyles = makeStyles((theme) => ({
  thead: {
    fontWeight: "bold",
  },
  submit: {
    margin: theme.spacing(3, 2, 2),
  },
}));

const camelToText = function (camel) {
  let text = camel.replace(/([A-Z])/g, " $1");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function IndicatorInfo(props) {
  React.useEffect(
    () => {
      let status;
      let params = (new URL(document.location)).searchParams;
      let indicatorIdParam = params.get('indicator');
      if (indicatorIdParam){
        fetchIndicator(indicatorIdParam)
      }
      fetch("/units/", {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) =>{status = response.status; return response.json();} )
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setUnits(responseJson.unidades)
          } else if(status === 403){
            localStorage.removeItem("HUNToken");
            window.location.reload(); 
          }
        })
    }, []
  );
  const classes = useStyles();
  const [loading, setLoading] = React.useState(false)
  const [units, setUnits] = React.useState([])
  const [indicators, setIndicators] = React.useState([])
  const [unit, setUnit] = React.useState("")
  const [indicator, setIndicator] = React.useState(null)
  const [indicatorCopy, setIndicatorCopy] = React.useState(null)
  const [editing, setEditing] = React.useState(false)
  const [editModalVisible, setEditModalVisible] = React.useState(false)

  const handleClickEdit = () => {
    setEditing(true);
    setIndicatorCopy(indicator);
  }
  const confirmEdit = () => {
    setEditing(false);
    setEditModalVisible(false)

  }
  const handleClickSave = () => {
    setEditModalVisible(true)
  }
  const handleClickCancel = () => {
    setEditing(false);
    setIndicator(indicatorCopy);
  }
  const handleChange = (event) => {
    setIndicator({
      ...indicator,
      [event.target.name]: event.target.value.trim(),
    });
  }

  const handleUnitChange = (newUnit) => {
    props.setIndicatorId(null)
    let currentUnit = units.find(u => u.nombre === newUnit);
    if (currentUnit) {
      setUnit(currentUnit)
      setIndicator(null)
      fetch(`/indicators/names/${currentUnit.idUnidad}`, {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setIndicators(responseJson.indicadores)
          }
        })
    }
  }
  const handleIndicatorChange = (newIndicator) => {
    props.setIndicatorId(null)
    let currentIndicator = indicators.find(u => u.nombre === newIndicator);
    if (currentIndicator) {
      setIndicator(currentIndicator)
      fetchIndicator(currentIndicator.idIndicador)
    }
  }
  const fetchIndicator = (indicatorId) =>{
    fetch(`/indicators/${indicatorId}`, {
      method: 'GET',
      headers: {
        'x-access-token': localStorage.getItem("HUNToken")
      },
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        if (responseJson.success) {
          delete responseJson.indicador.idPeriodo
          delete responseJson.indicador.idUnidad
          delete responseJson.indicador.inicioPeriodoActual
          delete responseJson.indicador.finPeriodoActual
          delete responseJson.indicador.periodoActual
          delete responseJson.indicador.unidad
          setIndicator(responseJson.indicador)
          props.setIndicatorId(responseJson.indicador.idIndicador)
        }
      })

  }

  return (
    <React.Fragment>
      <Title>Información del Indicador</Title>
      <Grid container spacing={3}>
        <Grid item xs>
          <Dropdown type="Unidad" options={units.map(u => u.nombre)} handleDropdownChange={handleUnitChange} />
        </Grid>
        <Grid item xs>
          <Dropdown type="Indicador" options={indicators.map(u => u.nombre)} handleDropdownChange={handleIndicatorChange} />
        </Grid>
      </Grid>
      {
        loading ?
          <div className="loader"></div> :
          indicator &&
          <div>
            <Table size="small">
              <TableBody>
                {Object.keys(indicator).map((k, i) => (
                  (k !== "periodicidad" || !editing)&& k!=="idIndicador" &&
                  <TableRow key={i}>
                    <TableCell className={classes.thead}>{camelToText(k)}</TableCell>
                    <TableCell>
                      {editing ?
                        <TextField
                          margin="normal"
                          fullWidth
                          type={k === "meta"? "number": "default"}
                          id={i}
                          label={camelToText(k)}
                          name={k}
                          value={indicator[k]}
                          autoComplete={k}
                          onChange={handleChange}
                          multiline = {k !== "meta"}
                        /> :
                        indicator[k]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Grid container spacing={3}>
              <Grid item xs>
                {
                  props.admin ? editing ?
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
                    <span />
                }
              </Grid>
            </Grid>
          </div>
      }
      <UpdateIndicatorModal 
      open ={editModalVisible} 
      setOpen={setEditModalVisible} 
      confirmEdit ={confirmEdit}
      indicator ={indicator}
      />
    </React.Fragment>
  );
}