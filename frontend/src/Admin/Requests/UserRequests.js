import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import IconButton from '@material-ui/core/IconButton';
import { green, red } from '@material-ui/core/colors';
import Tooltip from '@material-ui/core/Tooltip';
import EnableAccess from './EnableAccess';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Dropdown from '../../Shared/Dropdown';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import esLocale from 'date-fns/locale/es'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import moment from 'moment';

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
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
  grantAccess: {
    color: green[500],
  },
  denyAccess: {
    color: red[500],
  }
}));

export default function UserRequests(props) {
  React.useEffect(
    () => {
      let status;
      if (props.userRequests.length > 0) {
        fetch(`/requests/onHold/usersIndicators/${props.userRequests[0].idEstado}/`, {
          method: 'GET',
          headers: {
            'x-access-token': localStorage.getItem("HUNToken")
          },
        }).then((response) =>{status = response.status; return response.json();} )
          .then((responseJson) => {
            if (responseJson.success) {
              setRows(responseJson.solicitudes);
            } else if(status === 403){
              localStorage.removeItem("HUNToken");
              window.location.reload(); 
            }
          });
      }
      fetch("/requests/hostoricInfo/", {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => {status = response.status; return response.json();})
        .then((responseJson) => {
          if(responseJson.success) {
            setRequests(responseJson.solicitudes);
          } else if(status === 403){
            localStorage.removeItem("HUNToken");
            window.location.reload(); 
          }
        });
    }, [props]
  );
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [approve, setApprove] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [requests, setRequests] = React.useState([]);
  const [filteredUser, setFilteredUser] = React.useState("");
  const [filteredInitDate, setInitDate] = React.useState(null);
  const [filteredEndDate, setEndDate] = React.useState(null);

  const handleOpen = (row) => {
    setSelectedUser(row);
    setApprove(true);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAccessDenied = (row) => {
    setSelectedUser(row);
    setApprove(false);
    setOpen(true);
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleUserChange = (user) => {
    setFilteredUser(user);
  }

  const handleInitDateChange = (date) => {
    setInitDate(date);
  }

  const handleEndDateChange = (date) => {
    setEndDate(date);
  }

  const renderUserRequests = () => {
    return (
      <React.Fragment>
        <Title>Solicitudes</Title>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Usuario Solicitante</TableCell>
              <TableCell align="left">Indicador Solicitado</TableCell>
              <TableCell align="left">Comentario</TableCell>
              <TableCell align="left">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.userRequests.length ? rows.map((row) => (
              <TableRow key={row.idSolicitud}>
                <TableCell align="left">{`${row.nombre[0]} ${row.apellidos}`}</TableCell>
                <TableCell align="left">{row.nombre[1]}</TableCell>
                <TableCell align="left">{row.comentario}</TableCell>
                <TableCell align="left">
                  <Tooltip title="Habilitar acceso">
                    <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="grant access"
                    onClick={() => handleOpen(row)}
                    >
                      <CheckCircleOutlineIcon className={classes.grantAccess} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Negar acceso">
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="deny access"
                      onClick={() => handleAccessDenied(row)}
                    >
                      <HighlightOffIcon className={classes.denyAccess} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={4} align="center">No hay solicitudes en este momento.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </React.Fragment>
    )
  }

  const renderExtraTemporalRequests = () => {
    return (
      <React.Fragment>
        <Title>Histórico de Solicitudes Extratemporales</Title>
        <Grid container>
          <Grid item xs={4}>
            <Dropdown 
              type="Filtrar por usuario"
              options={[...new Set(requests.map(a => `${a.username} ${a.lastname}`))]}
              handleDropdownChange={handleUserChange}
            />
          </Grid>
          {/*<Grid item xs={8}>
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={esLocale}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <DatePicker
                  autoOk
                  variant="inline"
                  value={filteredInitDate}
                  label="Fecha desde"
                  onChange={handleInitDateChange}
                  format="dd/MM/yyyy"
                />
                </Grid>
                <Grid item xs={6}>
                <DatePicker
                  autoOk
                  variant="inline"
                  value={filteredEndDate}
                  label="Fecha hasta"
                  onChange={handleEndDateChange}
                  format="dd/MM/yyyy"
                />
                </Grid>
              </Grid>
            </MuiPickersUtilsProvider>
        </Grid>*/}
        </Grid>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="left">Fecha de Solicitud</TableCell>
              <TableCell align="left">Usuario Solicitante</TableCell>
              <TableCell align="left">Indicador Solicitado</TableCell>
              <TableCell align="left">Responsable del Indicador</TableCell>
              <TableCell align="left">Comentario</TableCell>
              <TableCell align="left">Estado</TableCell>
              <TableCell align="left">Acceso desde</TableCell>
              <TableCell align="left">Acceso hasta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length ? filteredRequests().map((request) => (
              <TableRow key={request.idSolicitud}>
                <TableCell align="left">{request.fecha}</TableCell>
                <TableCell align="left">{`${request.username} ${request.lastname}`}</TableCell>
                <TableCell align="left">{request.indicator}</TableCell>
                <TableCell align="left">{request.responsableDelIndicador}</TableCell>
                <TableCell align="left">{request.comentario ? request.comentario : "N/A"}</TableCell>
                <TableCell align="left">{request.estado}</TableCell>
                <TableCell align="left">{request.fechaInicio ? `${months[new Date(request.fechaInicio).getMonth()]} ${new Date(request.fechaInicio).getDate()} ${new Date(request.fechaInicio).getFullYear()}` : "N/A"}</TableCell>
                <TableCell align="left">{request.fechaFin ? `${months[new Date(request.fechaFin).getMonth()]} ${new Date(request.fechaFin).getDate()} ${new Date(request.fechaFin).getFullYear()}` : "N/A"}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={7} align="center">No hay accesos extratemporales.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </React.Fragment>
    );
  }

  const filteredRequests = () => {
    let filteredRequests = requests;
    //console.log(moment(new Date(requests[1].fecha)))
    //console.log(filteredInitDate ? moment(filteredInitDate.toDateString()).isSameOrBefore(requests[1].fecha) : "es null");
    if(filteredUser) filteredRequests = filteredRequests.filter(request => `${request.username} ${request.lastname}` === filteredUser);
    //if(filteredInitDate) filteredRequests = filteredRequests.filter(request => moment(filteredInitDate).isSameOrBefore(new Date(request.fecha))); //filteredRequests.filter()
    //if(filteredEndDate) filteredRequests = filteredRequests.filter(request => moment(filteredEndDate.toDateString()).isSameOrAfter(new Date(request.fecha))); //filteredRequests.filter()
    return filteredRequests;
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer}/>
      <div className={classes.root}>
        <AppBar color="transparent" position="static">
          <Tabs centered value={value} onChange={handleChange} aria-label="simple tabs example">
            <Tab label="Solicitudes" {...a11yProps(0)} />
            <Tab label="Histórico" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
      </div>
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            {value ? renderExtraTemporalRequests() : renderUserRequests()}
          </Paper>
        </React.Fragment>
      </Container>
      <EnableAccess closeModal={handleClose} open={open} approve={approve} user={selectedUser}/>
    </main>
  );
}