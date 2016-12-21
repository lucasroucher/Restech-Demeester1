import React, { Component } from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from 'react-bootstrap';

class MenuBar extends Component {
  render() {
    return (
      <Navbar fixedTop fluid onSelect={this.props.onSelect}>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="http://www.restech.com/" target="_blank">Restech DataView</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavItem eventKey="new" href="#">New</NavItem>
            <NavItem eventKey="retrieve" href="#">Retrieve</NavItem>
            <NavItem eventKey="open" href="#">Open</NavItem>
            <NavItem eventKey="print" href="#">Print</NavItem>
            <NavItem eventKey="report" href="#">Report</NavItem>
            <NavItem eventKey="save" href="#">Save</NavItem>
            <NavItem eventKey="settings" href="#" className="visible-xs">Settings</NavItem>
            <NavItem eventKey="help" href="#" className="visible-xs">Help</NavItem>
          </Nav>
          <Nav pullRight className="hidden-xs">
            <NavDropdown id="dropdown" title={<Glyphicon glyph="cog" />} noCaret>
              <MenuItem eventKey="settings">Settings</MenuItem>
              <MenuItem eventKey="help">Help</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default MenuBar;
