/* eslint-disable no-unused-vars */
import React from 'react'
import { Container } from 'reactstrap'
import Grid from './Grid'

const Display: React.FC = () => {
  return (
    <Container className="py-4 mx-4" style={{ maxWidth: 'none' }}>
      <Grid />
    </Container>
  )
}

export default Display
