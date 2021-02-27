/* eslint-disable no-unused-vars */
import React from 'react'
import { Navbar, NavbarBrand, Nav } from 'reactstrap'
import styles from './NavBar.module.css'
import { Link } from 'react-router-dom'

const NavbarComponent: React.FC = () => {
  return (
    <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand className={styles['navbar-brand']}>
          React Simple Cells
        </NavbarBrand>
        <Nav className="mx-2">
          <Link to="/spreadsheet">spreadsheet</Link>
        </Nav>
      </Navbar>
    </div>
  )
}

export default NavbarComponent
