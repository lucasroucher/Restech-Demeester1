import React, { Component } from 'react';
import { connect } from 'react-redux';
import MenuBar from './MenuBar';
import NewStudyModal from './NewStudyModal';
import showNewModal from '../actions/showNewModal';

class App extends Component {
  render() {
    return (
      <div>
        <MenuBar onSelect={this.handleSelect} />
        <NewStudyModal show={this.props.newModalShowing}
          onSave={this.handleSave}
          onClose={this.handleClose} />
        <p>content will go here</p>
      </div>
    );
  }

  handleSelect = (eventKey, event) => {
    switch (eventKey) {
      case 'new':
        // return this.setState({ showNewModal: true });
        return this.props.showNewModal();
      default:
    }
  }

  handleSave = () => {
    console.log('save');
    this.handleClose();
  }

  handleClose = () => {
    this.setState({ showNewModal: false });
  }
}

function mapStateToProps(state) {
  return { newModalShowing: state.newModalShowing };
}

const mapDispatchToProps = { showNewModal };

export default connect(mapStateToProps, mapDispatchToProps)(App);
