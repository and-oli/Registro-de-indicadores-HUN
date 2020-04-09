import React from 'react';
import { makeStyles } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Title from '../Shared/Title';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
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

export default function AccessDenied() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClick = () => {
    setOpen(true);
  }
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };
  return (
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Container maxWidth="lg" className={classes.container}>
        <React.Fragment>
          <Paper>
            <Title>Registrar Indicador</Title>
            <Grid container spacing={3}>
              <Grid item xs>
                <Typography color="textSecondary">
                  Dropdown Servicio
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography color="textSecondary">
                  Dropdown Indicador
                </Typography>
              </Grid>
            </Grid>
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={2} />
              <Grid item xs={8}>
                <Alert severity="warning">Usted no tiene acceso a este indicador</Alert>
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
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={handleClick}
                >
                  Solicitar Acceso
                </Button>
              </Grid>              
            </Grid>
          </Paper>
        </React.Fragment>
      </Container>
    </main>
  );
}