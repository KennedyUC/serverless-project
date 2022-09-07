import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import * as serviceWorker from './serviceWorker'
import 'semantic-ui-css/semantic.min.css'
//import * as ReactDOMClient from 'react-dom/client'
//import { createRoot } from 'react-dom/client'
import { makeAuthRouting } from './routing';

const container = document.getElementById('root')
const root = ReactDOM.createRoot(container!)
root.render(makeAuthRouting())
//ReactDOM.render(makeAuthRouting(), document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
