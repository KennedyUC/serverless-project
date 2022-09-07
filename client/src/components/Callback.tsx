import React, { useEffect } from 'react'
import Auth from '../auth/Auth'
import { createBrowserHistory } from 'history'
//import { Dimmer, Loader } from 'semantic-ui-react'
import { Todos } from './Todos';

const history = createBrowserHistory()
//const auth = new Auth(history)
var idtoken: string
//=>
/*function handleAuthentication(props: any)  {
  const location = window.location
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication().then((token) => {
      
      idtoken = token
      console.log('auth.token', idtoken)
      //auth.setIdToken(token)
      //console.log('auth.token3', auth.getIdToken())
    })
    console.log('auth.token2', idtoken)
  }
  
}*/
const Callback = async (auth: Auth) => {
  /*handleAuthentication(props)
  
  return (
    
 <Todos history={history} auth={auth}/>
  )*/
  const location = window.location
  if (/access_token|id_token|error/.test(location.hash)) {
    auth.handleAuthentication().then((result) => {
      
      idtoken = result.idToken
      //console.log('auth.token3', auth.getIdToken())
      
    })
   await setTimeout(()  => {
    auth.setIdToken(idtoken)
    console.log('auth.token', auth.getIdToken())
   }, 1000)
    /*.then(()  => {
      auth.setIdToken(idtoken)
  return (
    <Todos history={history} auth={auth}/>
     )
    })
    console.log('auth.token2', auth.getIdToken())*/
  }
  /*await setTimeout(()  => {
    console.log('auth.token', auth.getIdToken())
   }, 2000)*/
  
  return (
   
      <Todos history={history} auth={auth}/>
    
     )
  }

export default Callback
