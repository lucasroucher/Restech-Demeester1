import React, { Component } from 'react';
import { FormField, SelectField, UnitField } from './forms';

class PatientDetails extends Component {
  render() {
    return (
      <form>
        <FormField id="lastName" type="text" label="Last Name" disabled={this.props.disabled} />

        <FormField id="firstName" type="text" label="First Name" disabled={this.props.disabled} />

        <FormField id="studyDate" type="date" label="Study Date" disabled={this.props.disabled}
          defaultValue={new Date().toISOString().slice(0, 10)}
        />

        <FormField id="patientId" type="text" label="Patient ID" disabled={this.props.disabled} />

        <FormField id="birthDate" type="date" label="Birth Date" disabled={this.props.disabled} />

        <SelectField id="gender" label="Gender" disabled={this.props.disabled} options={[
          { label: 'male', value: 'male' },
          { label: 'female', value: 'female' }
        ]} />

        <UnitField id="weight" label="Weight" disabled={this.props.disabled} units={[
          { label: 'kg', value: 'kg' },
          { label: 'lb', value: 'lb' },
        ]} />

        <UnitField id="height" label="Height" disabled={this.props.disabled} units={[
          { label: 'cm', value: 'cm' },
          { label: 'in', value: 'in' },
        ]} />
      </form>
    );
  }
}

export default PatientDetails;
