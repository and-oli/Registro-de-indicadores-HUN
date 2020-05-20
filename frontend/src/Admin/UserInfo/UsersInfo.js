import React from 'react';
import { makeStyles, TableRow } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../../Shared/Title';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import NewUser from './NewUser';

const useStyles = makeStyles((theme) => ({
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  thead: {
    fontWeight: "bold",
  },
  cellContent: {
    "&:hover": {
      cursor: 'pointer',
      textDecoration: 'underline'
    }
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


export default function UsersInfo() {
  React.useEffect(
    () => {
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
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const goTo = (ind) =>{
    window.location = `/?indicator=${ind.idIndicador}`
  }
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
              {users.map((u, i) => (
                <TableBody key={i}  style = {{padding: "42px", display:"table", width: "80%",margin: "53px auto", border: "solid #d2d2d2 1px"}}>
                  <TableRow>
                    <TableCell className={classes.thead}>Usuario</TableCell>
                    <TableCell>
                      {u.username}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.thead}>Nombre</TableCell>
                    <TableCell>
                      {u.nombre + " " + u.apellidos}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.thead}>Unidades</TableCell>
                    <TableCell>
                      {u.unidades.join(", ")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className={classes.thead}>Indicadores</TableCell>
                    <TableCell>
                      {u.indicadores.map((ind, j) =>
                        <span
                          key={j}
                          className={classes.cellContent}
                          onClick={()=>goTo(ind)}
                        >
                          {ind.nombreIndicador + ", "}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>

              ))}
            </Table>
          </Paper>
        </React.Fragment>
      </Container>
      <NewUser open={open} handleClose={handleClose} />
    </main>
  );
}