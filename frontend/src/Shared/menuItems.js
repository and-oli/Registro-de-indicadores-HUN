  
import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Badge from '@material-ui/core/Badge';
import { Link } from 'react-router-dom';

export const secondaryListItemsAdmin = (
  <div>
    <ListItem component={Link} to={"/nuevo-indicador"} button>
      <ListItemIcon>
        <AddCircleOutlineIcon />
      </ListItemIcon>
      <ListItemText primary="Nuevo Indicador" />
    </ListItem>
  </div>
);

export const secondaryListItemsUser = (
  <div>
    <ListItem component={Link} to={"/registrar-indicador"} button>
      <ListItemIcon>
        <AddCircleOutlineIcon />
      </ListItemIcon>
      <ListItemText primary="Registrar valor de indicador" />
    </ListItem>
  </div>
);

export default function ListItems(props) {
  const usersTab = props.admin ? (
    <ListItem component={Link} to={"/usuarios"} button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Usuarios" />
    </ListItem>
  ) : <span />;

  return (
    <div>
      <ListSubheader inset>Acciones</ListSubheader>
      <ListItem component={Link} to={"/"} button>
        <ListItemIcon>
          <TrendingUpIcon />
        </ListItemIcon>
        <ListItemText primary="Indicadores" />
      </ListItem>
      <ListItem component={Link} to={`${props.admin ? 'admin' : 'user'}/solicitudes`} button>
        <ListItemIcon>
          {props.requests > 0 && props.admin ? <Badge badgeContent={props.requests} color="secondary">
            <AssignmentIcon />
          </Badge> : <AssignmentIcon />}
        </ListItemIcon>
        <ListItemText primary="Solicitudes" />
      </ListItem>
      {usersTab}
    </div>
  );
};