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
        <NewStudyModal show={this.props.newStudy.show} />
        <p>content will go here</p>
      </div>
    );
  }

  handleSelect = (eventKey, event) => {
    switch (eventKey) {
      case 'new':
        return this.props.showNewModal();
      default:
    }
  }
}

function mapStateToProps(state) {
  return { newStudy: state.newStudy };
}

const mapDispatchToProps = { showNewModal };

export default connect(mapStateToProps, mapDispatchToProps)(App);
