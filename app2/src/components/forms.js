import React, { Component } from 'react';
import {
  ControlLabel,
  DropdownButton,
  FormControl,
  FormGroup,
  HelpBlock,
  InputGroup,
  MenuItem,
} from 'react-bootstrap';

export function FormField({ id, label, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

export function SelectField({ id, label, options, help, ...props }) {
  return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl componentClass="select">
        {options.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
      </FormControl>
      {help && <HelpBlock>{help}</HelpBlock>}
    </FormGroup>
  );
}

export class UnitField extends Component {
  constructor(props) {
    super(props);

    this.state = {
      current: props.units[0].value
    };
  }

  render() {
    const { id, label, units, help } = this.props;

    return (
      <FormGroup controlId={id}>
        <ControlLabel>{label}</ControlLabel>
        <InputGroup>
          <FormControl type="text" />
          <DropdownButton
            id={id + "-dropdown-addon"}
            componentClass={InputGroup.Button}
            title={this.state.current}
            onSelect={newUnit => this.setState({ current: newUnit })}
          >
            {units.map(unit => (
              <MenuItem key={unit.value} eventKey={unit.value} active={this.state.current === unit.value}>{unit.label}</MenuItem>
            ))}
          </DropdownButton>
        </InputGroup>
        {help && <HelpBlock>{help}</HelpBlock>}
      </FormGroup>
    );
  }
}
