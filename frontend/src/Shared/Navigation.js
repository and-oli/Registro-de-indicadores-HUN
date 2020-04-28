import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import List from '@material-ui/core/List';
import ListItems, { secondaryListItemsAdmin, secondaryListItemsUser } from './menuItems';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import MainPage from './MainPage/MainPage';
import CreateIndicator from '../Admin/CreateIndicator';
import UserRequests from '../Admin/Requests/UserRequests';
import UsersInfo from '../Admin/UserInfo/UsersInfo';
import RegisterIndicator from '../User/RegisterIndicator';
//import AccessDenied from '../User/AccessDenied';
import AccessRequests from '../User/Requests/AccessRequests';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  logout: {
    fontSize: "15px",
    "&:hover": {
      cursor: 'pointer'
    }
  }
}));

export default function Navigation(props) {
  const { admin } = props;
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Registro De Indicadores HUN
          </Typography>
          <Typography component="h3" variant="h6" color="inherit" noWrap className={classes.logout}
            onClick={() => {
              localStorage.removeItem("HUNToken");
              localStorage.removeItem("HUNAdmin");
              window.location.reload()
            }}>
            Salir
          </Typography>
        </Toolbar>
      </AppBar>
      <Router>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
          }}
          open={open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItems admin={admin} />
            {admin ? secondaryListItemsAdmin : secondaryListItemsUser}
          </List>
          <Divider />
        </Drawer>
        <Switch>
          <Route exact path="/">
            <MainPage admin={admin} />
          </Route>
          <Route path="/admin/solicitudes">
            <UserRequests />
          </Route>
          <Route path="/user/solicitudes">
            <AccessRequests />
          </Route>
          <Route path="/usuarios">
            <UsersInfo />
          </Route>
          <Route path="/editar-indicador">
            <MainPage />
          </Route>
          <Route path="/nuevo-indicador">
            <CreateIndicator />
          </Route>
          <Route path="/registrar-indicador">
            <RegisterIndicator />
          </Route>
        </Switch>
      </Router>
      {/*<AccessDenied />*/}
    </div>
  );
}