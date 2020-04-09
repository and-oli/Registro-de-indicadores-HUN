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

function createData(id, user, indicator) {
  return { id, user, indicator };
}
  
const rows = [
  createData(0, 'Frozen yoghurt', 'Indicador 1'),
  createData(1, 'Ice cream sandwich', 'Indicador 3'),
  createData(2, 'Eclair', 'Indicador 4'),
  createData(3, 'Cupcake', 'Indicador 5'),
  createData(4, 'Gingerbread', 'Indicador 6'),
];

export default function UserRequests() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAccessDenied = () => {
    console.log('falta implementar acción');
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>Solicitudes</Title>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Usuario Solicitante</TableCell>
                  <TableCell align="left">Indicador Solicitado</TableCell>
                  <TableCell align="left">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell align="left">{row.user}</TableCell>
                    <TableCell align="left">{row.indicator}</TableCell>
                    <TableCell align="left">
                      <Tooltip title="Habilitar acceso">
                        <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="grant access"
                        onClick={handleOpen}
                        >
                          <CheckCircleOutlineIcon className={classes.grantAccess} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Negar acceso">
                        <IconButton
                          edge="start"
                          color="inherit"
                          aria-label="deny access"
                          onClick={handleAccessDenied}
                        >
                          <HighlightOffIcon className={classes.denyAccess} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
      <EnableAccess open={open} handleClose={handleClose}/>
    </main>
  );
}