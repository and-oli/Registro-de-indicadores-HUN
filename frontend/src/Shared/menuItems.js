  
import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SpellcheckIcon from '@material-ui/icons/Spellcheck';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Badge from '@material-ui/core/Badge';
import { Link } from 'react-router-dom';

export const mainListItems = (
  <div>
    <ListItem component={Link} to={"/"} button>
      <ListItemIcon>
        <TrendingUpIcon />
      </ListItemIcon>
      <ListItemText primary="Indicadores" />
    </ListItem>
    <ListItem component={Link} to={"/solicitudes"} button>
      <ListItemIcon>
        <Badge badgeContent={4} color="secondary">
          <AssignmentIcon />
        </Badge>
      </ListItemIcon>
      <ListItemText primary="Solicitudes" />
    </ListItem>
    <ListItem component={Link} to={"/usuarios"} button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Usuarios" />
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Acciones</ListSubheader>
    <ListItem component={Link} to={"/autorizar"} button>
      <ListItemIcon>
        <AccessTimeIcon />
      </ListItemIcon>
      <ListItemText primary="Autorizar Usuario" />
    </ListItem>
    <ListItem component={Link} to={"/editar-indicador"} button>
      <ListItemIcon>
        <SpellcheckIcon />
      </ListItemIcon>
      <ListItemText primary="Editar Indicador" />
    </ListItem>
    <ListItem component={Link} to={"/nuevo-indicador"} button>
      <ListItemIcon>
        <AddCircleOutlineIcon />
      </ListItemIcon>
      <ListItemText primary="Nuevo Indicador" />
    </ListItem>
  </div>
);