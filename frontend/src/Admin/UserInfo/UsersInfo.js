import React from 'react';
import { makeStyles, TableRow } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import UserInfo from './UserInfo';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import Button from '@material-ui/core/Button';
import NewUser from './NewUser';

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

function createData(id, user, data) {
  return { id, user, data };
}

const rows = [
  createData(0, 'Usuario 1', [{indicator: 'Indicador 1', initDate: '20/08/2020', endDate:'27/08/2020'},
                                   {indicator: 'Indicador 2', initDate: '20/08/2020', endDate:'27/08/2020'},
                                   {indicator: 'Indicador 3', initDate: '20/08/2020', endDate:'27/08/2020'},
                                   {indicator: 'Indicador 4', initDate: '20/08/2020', endDate:'27/08/2020'},
                                   {indicator: 'Indicador 5', initDate: '20/08/2020', endDate:'27/08/2020'},]),
  createData(1, 'Usuario 2', [{indicator: 'Indicador 1', initDate: '20/08/2020', endDate:'27/08/2020'},
                                       {indicator: 'Indicador 2', initDate: '20/08/2020', endDate:'27/08/2020'},
                                       {indicator: 'Indicador 3', initDate: '20/08/2020', endDate:'27/08/2020'},
                                       {indicator: 'Indicador 4', initDate: '20/08/2020', endDate:'27/08/2020'},
                                       {indicator: 'Indicador 5', initDate: '20/08/2020', endDate:'27/08/2020'},]),
  createData(2, 'Usuario 3', [{indicator: 'Indicador 1', initDate: '20/08/2020', endDate:'27/08/2020'},
                           {indicator: 'Indicador 2', initDate: '20/08/2020', endDate:'27/08/2020'},
                           {indicator: 'Indicador 3', initDate: '20/08/2020', endDate:'27/08/2020'},
                           {indicator: 'Indicador 4', initDate: '20/08/2020', endDate:'27/08/2020'},
                           {indicator: 'Indicador 5', initDate: '20/08/2020', endDate:'27/08/2020'},]),
  createData(3, 'Usuario 4', [{indicator: 'Indicador 1', initDate: '20/08/2020', endDate:'27/08/2020'},
                            {indicator: 'Indicador 2', initDate: '20/08/2020', endDate:'27/08/2020'},
                            {indicator: 'Indicador 3', initDate: '20/08/2020', endDate:'27/08/2020'},
                            {indicator: 'Indicador 4', initDate: '20/08/2020', endDate:'27/08/2020'},
                            {indicator: 'Indicador 5', initDate: '20/08/2020', endDate:'27/08/2020'},]),
  createData(4, 'Usuario 5', [{indicator: 'Indicador 1', initDate: '20/08/2020', endDate:'27/08/2020'},
                                {indicator: 'Indicador 2', initDate: '20/08/2020', endDate:'27/08/2020'},
                                {indicator: 'Indicador 3', initDate: '20/08/2020', endDate:'27/08/2020'},
                                {indicator: 'Indicador 4', initDate: '20/08/2020', endDate:'27/08/2020'},
                                {indicator: 'Indicador 5', initDate: '20/08/2020', endDate:'27/08/2020'},]),
];

export default function UsersInfo() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>Información de usuarios</Title>
            <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleOpen}
              >
                Nuevo Usuario
            </Button>
            <Table size="small">
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <TreeView
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                      >
                        <TreeItem nodeId={`${row.id}`} label={row.user} children={<UserInfo user={row.user} data={row.data} />} />
                      </TreeView>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
      <NewUser open={open} handleClose={handleClose}/>
    </main>
  );
}