import React, { Component } from 'react';
import { FormField, SelectField, UnitField } from './forms';

class PatientDetails extends Component {
  render() {
    return (
      <form>
        <FormField id="lastName" type="text" label="Last Name" />

        <FormField id="firstName" type="text" label="First Name" />

        <FormField id="studyDate" type="date" label="Study Date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />

        <FormField id="patientId" type="text" label="Patient ID" />

        <FormField id="birthDate" type="date" label="Birth Date" />

        <SelectField id="gender" label="Gender" options={[
          { label: 'male', value: 'male' },
          { label: 'female', value: 'female' }
        ]} />

        <UnitField id="weight" label="Weight" units={[
          { label: 'kg', value: 'kg' },
          { label: 'lb', value: 'lb' },
        ]} />

        <UnitField id="height" label="Height" units={[
          { label: 'cm', value: 'cm' },
          { label: 'in', value: 'in' },
        ]} />
      </form>
    );
  }
}

export default PatientDetails;
