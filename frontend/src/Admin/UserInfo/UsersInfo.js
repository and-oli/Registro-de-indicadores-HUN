import React from 'react';
import { makeStyles, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Button from '@material-ui/core/Button';
import NewUser from './NewUser';
import EditIcon from '@material-ui/icons/Edit';
import EditUser from './EditUser';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
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

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEditUserModalOpen = (open, userId, indicators, units, accesses) => {
    if (open) {
      let myCurrentUserPermissions = indicators.map(ind => {
        return {
          nombre: ind.nombreIndicador,
          idIndicador: ind.idIndicador,
          idUnidad: ind.idUnidad,
        }
      })
      units.forEach(element => {
        myCurrentUserPermissions.push({
          nombre: `TODOS (${element.nombreUnidad})`,
          idIndicador: -1,
          idUnidad: element.idUnidad
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
            {
              loading ?
                <div className="loader"></div> :
                users.map((u, i) => (
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
                            {u.unidades.map(und => und.nombreUnidad).join(", ")}
                          </TableCell>
                        </TableRow>
                        <TableRow className="user-info-content ">
                          <TableCell className={classes.thead}>Indicadores</TableCell>
                          <TableCell className={classes.tcell}>
                            {u.indicadores.map((ind, j) =>
                              <span
                                key={j}
                                className={classes.cellContent}
                                onClick={() => goTo(ind.idIndicador)}
                              >
                                {ind.nombreIndicador}
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
                      onClick={() => { handleEditUserModalOpen(true, u.idUsuario, u.indicadores, u.unidades, u.accesos) }}
                    />
                  </Paper>
                ))
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