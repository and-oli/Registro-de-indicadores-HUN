import React from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignIn() {
  const classes = useStyles();
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [message, setMessage] = React.useState({ text: "", color: "green" })
  const [loading, setLoading] = React.useState(false)

  const submitCredentials = function (e) {
    e.preventDefault();
    if (!loading) {
      setLoading(true)
      let data = { username, password }
      fetch("/users/authenticate", {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then((response) => response.json())
        .then((responseJson) => {
          setLoading(false)
          if (responseJson.success) {
            localStorage.setItem("HUNToken", responseJson.token);
            localStorage.setItem("HUNAdmin", responseJson.admin);
            window.location.reload();
            setMessage({ color: "green", text: responseJson.message })
          } else {
            setMessage({ color: "red", text: responseJson.message })
          }
        })
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Iniciar Sesión
        </Typography>
        <form
          className={classes.form}
          onSubmit={submitCredentials}
        >
          <TextField
            onChange={(e) => { setUsername(e.target.value) }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            type="email"
            label="Correo Electrónico"
            name="email"
            value={username}
            autoComplete="email"
            autoFocus
          />
          <TextField
            onChange={(e) => { setPassword(e.target.value) }}
            variant="outlined"
            margin="normal"
            required
            fullWidth
            value={password}
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          {loading ?
            <div className="loader"></div> :
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Iniciar Sesión
          </Button>
          }
        </form>
        <div style={{ color: message.color }}>{message.text}</div>
      </div>
    </Container>
  );
}