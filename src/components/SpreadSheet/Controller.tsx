/* eslint-disable no-unused-vars */
import React from 'react'
import { Container, Row, Button, Col } from 'reactstrap'
import { useDispatch } from 'react-redux'

const Controller: React.FC = () => {
  const dispatch = useDispatch()

  const propReset = {
    props: {
      color: 'secondary',
      onClick: () => {
        dispatch({ type: 'GRIDSTATE_RESET', payload: { H: 6, W: 6 } })
      },
    },
    text: 'Reset Cells',
  }

  const propsAddRow = {
    props: {
      color: 'secondary',
      onClick: () => {
        dispatch({ type: 'GRIDSTATE_ADD_ROW' })
      },
    },
    text: 'Add Row',
  }

  const propsRemoveRow = {
    props: {
      color: 'secondary',
      onClick: () => {
        dispatch({ type: 'GRIDSTATE_REMOVE_ROW' })
      },
    },
    text: 'Remove Row',
  }

  const propsAddColumn = {
    props: {
      color: 'secondary',
      onClick: () => {
        dispatch({ type: 'GRIDSTATE_ADD_COLUMN' })
      },
    },
    text: 'Add Column',
  }

  const propsRemoveColumn = {
    props: {
      color: 'secondary',
      onClick: () => {
        dispatch({ type: 'GRIDSTATE_REMOVE_COLUMN' })
      },
    },
    text: 'Remove Column',
  }

  return (
    <Container className="py-4 mx-4">
      <Row className="my-2 align-items-center">
        <Col xs="auto" className="px-0 mx-1">
          <Button {...propReset.props}> {propReset.text} </Button>
        </Col>
      </Row>
      <Row className="my-2 align-items-center">
        <Col xs="auto" className="px-0 mx-1">
          <Button {...propsAddRow.props}> {propsAddRow.text} </Button>
        </Col>
        <Col xs="auto" className="px-0 mx-1">
          <Button {...propsRemoveRow.props}> {propsRemoveRow.text} </Button>
        </Col>
      </Row>
      <Row className="my-2 align-items-center">
        <Col xs="auto" className="px-0 mx-1">
          <Button {...propsAddColumn.props}> {propsAddColumn.text} </Button>
        </Col>
        <Col xs="auto" className="px-0 mx-1">
          <Button {...propsRemoveColumn.props}>{propsRemoveColumn.text}</Button>
        </Col>
      </Row>
    </Container>
  )
}

export default Controller
