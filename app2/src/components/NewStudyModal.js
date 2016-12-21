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
              <PatientDetails disabled={this.props.saving} />
            </Tab>
            <Tab title="Custom Symptoms" eventKey="customSymptoms"></Tab>
            <Tab title="Study Details" eventKey="studyDetails" disabled></Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.hideNewModal}>Cancel</Button>
          <Button onClick={this.props.saveNewStudy} bsStyle="primary" disabled={this.props.saving}>Save</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return { saving: state.newStudy.saving };
}

export default connect(mapStateToProps, { hideNewModal, saveNewStudy })(NewModal);
