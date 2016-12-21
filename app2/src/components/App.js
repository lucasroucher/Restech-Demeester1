import React, { Component } from 'react';
import { connect } from 'react-redux';
import MenuBar from './MenuBar';
import NewStudyModal from './NewStudyModal';
import showNewModal from '../actions/showNewModal';

class App extends Component {
  render() {
    return (
      <div>
        <MenuBar onSelect={this.select.bind(this)} />
        <NewStudyModal show={this.props.newModalShowing}
          onSave={this.saveNewStudy.bind(this)}
          onClose={this.closeNewModal.bind(this)} />
        <p>content will go here</p>
      </div>
    );
  }

  select(eventKey, event) {
    switch (eventKey) {
      case 'new':
        // return this.setState({ showNewModal: true });
        return this.props.showNewModal();
      default:
    }
  }

  saveNewStudy() {
    console.log('save');
    this.closeNewModal();
  }

  closeNewModal() {
    this.setState({ showNewModal: false });
  }
}

function mapStateToProps(state) {
  return { newModalShowing: state.newModalShowing };
}

const mapDispatchToProps = { showNewModal };

export default connect(mapStateToProps, mapDispatchToProps)(App);
