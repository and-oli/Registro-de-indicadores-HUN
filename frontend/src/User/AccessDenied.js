import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import MuiAlert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';

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
  const handleClick = () => {
    setOpen(true);
    setRequested(true);
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const message = props.hasRequested || hasRequested ? <Alert severity="warning">Usted ya solicitó acceso a este indicador. Contáctese con el administrador para que le otorge permiso de registro.</Alert> 
                                      : <Alert severity="error">No tiene permiso para editar este indicador en este momento.</Alert>;
  return (
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
                  anchorOrigin={{vertical: 'top', horizontal: 'center' }}
                  key={'top,center'}
                >
                  <Alert onClose={handleClose} severity="success">
                    Ha solicitado acceso exitosamente
                  </Alert>
                </Snackbar>
                {!props.hasRequested && !hasRequested ? <Button
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={handleClick}
                >
                  Solicitar Acceso
                </Button> : <span/>}
              </Grid>              
            </Grid>
        </React.Fragment>
      </Container>
  );
}