import React from 'react';
import { makeStyles, TableRow } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Request from './Request';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';

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
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function createData(id, request, data) {
  return { id, request, data };
}

const rows = [
  createData(0, 'Solicitud 1', [{label: 'Indicador', value: 'Indicador 1',},
                                {label: 'Fecha Solicitud', value: '20/08/2020',},
                                {label: 'Estado', value: 'Pendiente',},]),
  createData(1, 'Solicitud 2', [{label: 'Indicador', value: 'Indicador 2',},
                                {label: 'Fecha Solicitud', value: '20/08/2020',},
                                {label: 'Estado', value: 'Pendiente',},]),
  createData(2, 'Solicitud 3', [{label: 'Indicador', value: 'Indicador 3',},
                                {label: 'Fecha Solicitud', value: '20/08/2020',},
                                {label: 'Estado', value: 'Pendiente',},]),
  createData(3, 'Solicitud 4', [{label: 'Indicador', value: 'Indicador 4',},
                                {label: 'Fecha Solicitud', value: '20/08/2020',},
                                {label: 'Estado', value: 'Pendiente',},]),
  createData(4, 'Solicitud 5', [{label: 'Indicador', value: 'Indicador 5',},
                                {label: 'Fecha Solicitud', value: '20/08/2020',},
                                {label: 'Estado', value: 'Pendiente',},]),
];

export default function AccessRequests() {
  const classes = useStyles();
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>Información de usuarios</Title>
            <Table size="small">
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                      >
                        <TreeItem nodeId={`${row.id}`} label={row.request} children={<Request label={row.request} rows={row.data} />} />
                      </TreeView>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
    </main>
  );
}