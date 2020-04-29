import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function Dropdown(props) {
  const classes = useStyles();

  const [value, setValue] = React.useState();

  const handleChange = (event) => {
    setValue(event.target.value);
    if(props.handleDropdownChange){
      props.handleDropdownChange(event.target.value);
    }
  }
  return (
    <FormControl required variant={props.variant ? props.variant : "standard"} className={classes.formControl}>
      <InputLabel htmlFor="dropdown">{props.type}</InputLabel>
      <Select
        native
        value={value}
        onChange={handleChange}
        label={props.type}
        inputProps={{
          id: 'dropdown',
        }}
      >
        <option aria-label="None" value="" />
        {props.options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </Select>
    </FormControl>
  );
}