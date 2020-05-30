import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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

export default function AccessDenied(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [hasRequested, setRequested] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [comment, setComment] = React.useState("");
  const [severity, setSeverity] = React.useState("");
  const [responseMessage, setResponseMessage] = React.useState("");

  const handleClick = () => {
    setLoading(true)
    let data = {
      idIndicador: props.indicatorId,
      comentario: comment
    }
    fetch("/requests/", {
      method: 'POST',
      headers: {
        'x-access-token': localStorage.getItem("HUNToken"),
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    }).then((response) => response.json())
      .then((responseJson) => {
        setLoading(false)
        if (responseJson.success) {
          setOpen(true);
          setSeverity("success")
          setRequested(true);
        }
        else{
          setOpen(true);
          setSeverity("error")
        }
        setResponseMessage(responseJson.message)
      })
  }
  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  React.useEffect(
    () => {
      setLoading(true)
      let data = { idIndicador: props.indicatorId }
      fetch("/requests/requestExists/", {
        method: 'POST',
        headers: {
          'x-access-token': localStorage.getItem("HUNToken"),
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            setRequested(responseJson.requestExists)
          }
        })
    }, [props]
  )
  const message = hasRequested ? <Alert severity="warning">Usted ya solicitó acceso a este indicador. Contáctese con el administrador para que le otorge permiso de registro.</Alert>
    : <Alert severity="error">No tiene permiso para editar este indicador en este momento.</Alert>;
  return (
    loading ?
    <div className="loader"></div> :
    <Container maxWidth="lg" className={classes.container}>
      <React.Fragment>
        <Grid container alignItems="center" spacing={3}>
          <Grid item xs={2} />
          <Grid item xs={8}>
            {message}
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs>
            <Snackbar open={open}
              autoHideDuration={6000}
              onClose={handleClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              key={'top,center'}
            >
              <Alert onClose={handleClose} severity={severity}>
                {responseMessage}
                  </Alert>
            </Snackbar>
            {!hasRequested ? 
            <div>
              <TextField
                margin="normal"
                id="comment"
                label="Comentario"
                name="comment"
                onChange={handleCommentChange}
                value={comment}
                autoFocus
              ></TextField>
              <br/>
            <Button
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleClick}
              >
              Solicitar Acceso
                </Button> 
              </div>
                : <span />
                }
          </Grid>
        </Grid>
      </React.Fragment>
    </Container>
  );
}