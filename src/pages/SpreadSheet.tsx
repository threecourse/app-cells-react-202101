import Layout from '../components/Layout'
import React from 'react'
import { Col, Row } from 'reactstrap'
import Controller from '../components/SpreadSheet/Controller'
import Display from '../components/SpreadSheet/Display'

const Page: React.FC = () => {
  return (
    <div className="App">
      <Layout>
        <Row>
          <Col md="3">
            <Controller />
          </Col>
          <Col md="9">
            <Display />
          </Col>
        </Row>
      </Layout>
    </div>
  )
}

export default Page
