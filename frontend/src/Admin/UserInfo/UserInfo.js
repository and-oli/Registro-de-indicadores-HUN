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
}));

export default function UserInfo(props) {
  const classes = useStyles();
  return (
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>{props.user}</Title>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Indicador</TableCell>
                  <TableCell align="left">Fecha Inicio</TableCell>
                  <TableCell align="left">Frcha Fín</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.data.map((d) => (
                  <TableRow key={d.indicator}>
                    <TableCell align="left">{d.indicator}</TableCell>
                    <TableCell align="left">{d.initDate}</TableCell>
                    <TableCell align="left">{d.endDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
  );
}