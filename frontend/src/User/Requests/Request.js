import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

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
  thead: {
    fontWeight: "bold",
    borderBottom: "none",
  },
  tcell: {
    borderBottom: "none",
  },
}));

export default function Request(props) {
  const classes = useStyles();
  return (
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper className={classes.paper}>
            <Title>{props.label}</Title>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell className={classes.thead} align="left">Indicador</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.indicador}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.thead} align="left">unidad</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.unidad}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.thead} align="left">Estado</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.estado}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.thead} align="left">Fecha de solicitud</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.fechaSolicitud}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.thead} align="left">Fecha de inicio del acceso</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.inicioAcceso|| "No aplica"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.thead} align="left">Fecha de fin del acceso</TableCell>
                  <TableCell className={classes.tcell} align="left">{props.request.finAcceso|| "No aplica"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
  );
}