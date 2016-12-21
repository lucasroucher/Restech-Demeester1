import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Tab, Tabs } from 'react-bootstrap';
import PatientDetails from './PatientDetails';
import hideNewModal from '../actions/hideNewModal';
import saveNewStudy from '../actions/saveNewStudy';

class NewModal extends Component {
  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.hideNewModal}>
        <Modal.Header closeButton>
          <Modal.Title>New Study</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs id="newStudyTabs" defaultActiveKey="patientDetails">
            <Tab title="Patient Details" eventKey="patientDetails">
              <PatientDetails />
            </Tab>
            <Tab title="Custom Symptoms" eventKey="customSymptoms"></Tab>
            <Tab title="Study Details" eventKey="studyDetails" disabled></Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.hideNewModal}>Cancel</Button>
          <Button onClick={this.props.saveNewStudy} bsStyle="primary">Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(null, { hideNewModal, saveNewStudy })(NewModal);
