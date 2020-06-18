import React from 'react';
import { makeStyles, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Button from '@material-ui/core/Button';
import NewUser from './NewUser';
import EditIcon from '@material-ui/icons/Edit';
import EditUser from './EditUser';
import TablePagination from '@material-ui/core/TablePagination';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  cellContentUnit: {
    display: "block",
  },
  cellContent: {
    "&:hover": {
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    display: "block",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
  },
  thead: {
    fontWeight: "bold",
    paddingLeft: "20px",
    textAlign: "center",
    width: "20%",
  },
  tcell: {
    textAlign: "center",
    overflowWrap: "break-word",
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));


export default function UsersInfo() {
  React.useEffect(
    () => {
      setLoading(true)
      let status;
      fetch("/users/employees/", {
        method: 'GET',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken")
        },
      }).then((response) => { status = response.status; return response.json(); })
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setUsers(responseJson.users)
          } else if (status === 403) {
            localStorage.removeItem("HUNToken");
            window.location.reload();
          }
        })
    }, []
  );
  const [users, setUsers] = React.useState([])
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState(null);
  const [currentUserPermissions, setCurrentUserPermissions] = React.useState([]);
  const [currentUserAccesses, setCurrentUserAccesses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [nameQuery, setNameQuery] = React.useState("");

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditUserModalOpen = (open, userId, indicators, readIndicators, units, readUnits, accesses) => {
    if (open) {
      let myCurrentUserPermissions = [...indicators, ...readIndicators]
      units.forEach(element => {
        myCurrentUserPermissions.push({
          ...element,
          nombre: `TODOS (${element.nombre.split(" (edición)")[0]}) (edición)`,
          idIndicador: -1,
        })
      });
      readUnits.forEach(element => {
        myCurrentUserPermissions.push({
          ...element,
          nombre: `TODOS (${element.nombre.split(" (lectura)")[0]}) (lectura)`,
          idIndicador: -1,
        })
      });
      setCurrentUserId(userId)
      setCurrentUserPermissions(myCurrentUserPermissions)
      setCurrentUserAccesses(accesses)
    }
    setEditUserModalOpen(open);
  };


  const goTo = (idIndicador) => {
    window.location = `/?indicator=${idIndicador}`
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };
  const handleQueryChange = (event) => {
    setNameQuery(event.target.value ? event.target.value.toLowerCase() : "")
    setPage(0);
  }

  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper className={classes.paper}>
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

            <div>
              <TextField
                variant="outlined"
                margin="normal"
                label="Buscar usuario"
                value={nameQuery}
                onChange={handleQueryChange}
              />
            </div>

            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onChangePage={handleChangePage}
              rowsPerPage={rowsPerPage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              labelRowsPerPage="Usuarios por página"
              rowsPerPageOptions={[10, 25, 50, 100, users.length].sort((a, b) => a - b)}
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
            {
              loading ?
                <div className="loader"></div> :
                users.filter(u => (u.username + u.nombre + u.apellidos).toLowerCase().includes(nameQuery))
                  .map((u, i) => (
                    <Paper className="user-info-paper" key={i}>
                      <Table className="user-info-table">
                        <TableBody>
                          <TableRow className="user-info-content">
                            <TableCell className={classes.thead}>Usuario</TableCell>
                            <TableCell className={classes.tcell}>
                              {u.username}
                            </TableCell>
                          </TableRow>

                          <TableRow className="user-info-content">
                            <TableCell className={classes.thead}>Nombre</TableCell>
                            <TableCell className={classes.tcell}>
                              {u.nombre + " " + u.apellidos}
                            </TableCell>
                          </TableRow>
                          <TableRow className="user-info-content">
                            <TableCell className={classes.thead}>Unidades</TableCell>
                            <TableCell className={classes.tcell}>
                              {[...u.unidadesLectura, ...u.unidades].map((und, j) =>
                                <span
                                  key={j}
                                  className={classes.cellContentUnit}
                                >
                                  {und.nombre}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow className="user-info-content ">
                            <TableCell className={classes.thead}>Indicadores</TableCell>
                            <TableCell className={classes.tcell}>
                              {[...u.indicadoresLectura, ...u.indicadores].map((ind, j) =>
                                <span
                                  key={j}
                                  className={classes.cellContent}
                                  onClick={() => goTo(ind.idIndicador)}
                                >
                                  {ind.nombre}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                          <TableRow className="user-info-content user-info-table">
                            <TableCell className={classes.thead}>Accesos</TableCell>
                            <TableCell className={classes.tcell}>
                              {u.accesos.map((acc, j) =>
                                <span
                                  key={j}
                                  className={classes.cellContent}
                                  onClick={() => goTo(acc.idIndicadorDelAcceso)}
                                >
                                  {acc.nombreIndicadorDelAcceso}
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <EditIcon
                        className="edit-user-icon"
                        onClick={() => { handleEditUserModalOpen(true, u.idUsuario, u.indicadores, u.indicadoresLectura, u.unidades, u.unidadesLectura, u.accesos) }}
                      />
                    </Paper>
                  )).filter((_, i) => i >= page * rowsPerPage && i < (page + 1) * rowsPerPage)
            }
          </Paper>
        </React.Fragment>
      </Container>
      <NewUser open={open} handleClose={handleClose} />
      <EditUser
        open={editUserModalOpen}
        handleEditUserModalOpen={handleEditUserModalOpen}
        currentUserId={currentUserId}
        currentUserPermissions={currentUserPermissions}
        currentUserAccesses={currentUserAccesses}
      />
    </main>
  );
}