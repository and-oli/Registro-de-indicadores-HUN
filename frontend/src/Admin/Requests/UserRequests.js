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

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
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
    }, [props]
  );
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [approve, setApprove] = React.useState(false);

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

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer}/>
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
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
                )) : <TableRow><TableCell colSpan={3} align="center">No hay solicitudes en este momento.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
      <EnableAccess closeModal={handleClose} open={open} approve={approve} user={selectedUser}/>
    </main>
  );
}