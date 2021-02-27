import React from 'react'
import './App.css'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Link, Route } from 'react-router-dom'
import rootReducer from './reducers'
import PageSpreadSheet from './pages/SpreadSheet'

const store = createStore(rootReducer)

function App() {
  return (
    <Router>
      <Provider store={store}>
        <Route exact path="/" component={PageSpreadSheet}></Route>
        <Route exact path="/spreadsheet" component={PageSpreadSheet}></Route>
      </Provider>
    </Router>
  )
}

export default App
