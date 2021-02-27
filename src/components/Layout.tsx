import NavBar from './NavBar'
import { Container } from 'reactstrap'
import React from 'react'

const Layout: React.FC = (props: any) => {
  return (
    <>
      <NavBar />
      <Container fluid="true">{props.children}</Container>
    </>
  )
}

export default Layout
