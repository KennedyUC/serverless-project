import auth0 from 'auth0-js';
import { authConfig } from '../config';

export default class Auth {
  accessToken;
  idToken;
  expiresAt;

  auth0 = new auth0.WebAuth({
    domain: authConfig.domain,
    clientID: authConfig.clientId,
    redirectUri: authConfig.callbackUrl,
    responseType: 'token id_token',
    scope: 'openid'
  });

  constructor(history) {
    this.history = history

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getIdToken = this.getIdToken.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        console.log('Access token: ', authResult.accessToken)
        console.log('id token: ', authResult.idToken)
        this.setSession(authResult);
        resolve(authResult);
      } else if (err) {
        this.history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
        reject(err);
      }
    });
  });
    
  }

  getAccessToken() {
    return this.accessToken;
  }
  
  setIdToken(idToken) {
    this.idToken = idToken
  }

  getIdToken() {
    return this.idToken;
    //return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IlU2ZktHckZxRHEyOUI3YlQwNXBfWCJ9.eyJpc3MiOiJodHRwczovL2Rldi0tYzhkYmc4bi51cy5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDI1MzU2Mjg4MjAyNDIwMDY2NTkiLCJhdWQiOiJFSGFRcGJvRzVHTkVCQW9lQzBFS0F2RGNYTUZiWExIMSIsImlhdCI6MTY2MjE0MjkyMiwiZXhwIjoxNjYyMTc4OTIyLCJhdF9oYXNoIjoieGpKNUxFUEg4Q2RFbWhGSjVnQThvUSIsInNpZCI6IjRhTzZrblVYaVR0VzRMd1dlZU5xMmEwcDk5d1FpdWlQIiwibm9uY2UiOiJHaVIxbzFQenNyakMzdVRwSnNhZFE0QzJpOVNLc19KNiJ9.nmsxUsvo6XEVpTV7xIgXHtGukBIOjCYEZyJjBbnEifDj3-cg6cIctq-FFz129Sj-yYQfaU8dIbGiNJtjcv_65bvXDT0ropkJX8HUNTL1eZp42Qq0KCA8p7ksYqAVEFowQ3aJr9eI2_6TMsSOKQ6b79OPq4_-5c4YcDshzqk5B0D42lT77PKuDl1Pywwog8LACK-kaSFKztZ_EUcza2-TiDaKVh81lpbj2RyrdTHR3ekH-eXjdF9oEZHFLEG2KOdpqmmvLeDByNupir_8up-AZpeVo44-L1c-d6kwq407jqpLROfve6D4tTs_2SUUu4Tdp6Fc3EQjcSQEA3DuEq_Ltg"
  }

  setSession(authResult) {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    // Set the time that the access token will expire at
    let expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;
    // navigate to the home route
    this.history.replace('/');
    
  }

  renewSession() {
    this.auth0.checkSession({}, (err, authResult) => {
       if (authResult && authResult.accessToken && authResult.idToken) {
         this.setSession(authResult);
       } else if (err) {
         this.logout();
         console.log(err);
         alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
       }
    });
  }

  logout() {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    this.auth0.logout({
      return_to: window.location.origin
    });

    // navigate to the home route
    this.history.replace('/');
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  }
}
