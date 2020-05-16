import 'bootstrap/dist/css/bootstrap.min.css';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Geocache from './components/geocache';
import Satchel from './components/satchel';
import Navbar from './components/navbar';
import SignIn from './components/signin';
import Home from './components/home';
import CreateCache from './components/createCache';
import { Container, Row, Col } from 'react-bootstrap';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: false,
    }
    this.funcs = {
      signedInFlow: this.signedInFlow.bind(this),
      requestSignIn: this.requestSignIn.bind(this),
      requestSignOut: this.requestSignOut.bind(this),
      signedOutFlow: this.signedOutFlow.bind(this)
    }
  }

  componentDidMount() {
    let loggedIn = this.props.wallet.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
    } else {
      this.signedOutFlow();
    }
  }

  async signedInFlow() {
    console.log("come in sign in flow")
    this.setState({
      login: true,
    })
    const accountId = await this.props.wallet.getAccountId()
    console.log(accountId)
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
  }

  async requestSignIn() {
    const appTitle = 'Geodes';
    await this.props.wallet.requestSignIn(
      window.nearConfig.contractName,
      appTitle
    )
  }

  requestSignOut() {
    this.props.wallet.signOut();
    setTimeout(this.signedOutFlow, 500);
    console.log("after sign out", this.props.wallet.isSignedIn())
  }

  signedOutFlow() {
    if (window.location.search.includes("account_id")) {
      window.location.replace(window.location.origin + window.location.pathname)
    }
    this.setState({
      login: false,
    })
  }

  render() {
    const redirectIfNotSignedIn = (child) => this.state.login ? child : <Redirect to="/"/>
    return (
      <Router>
        <Container>
          <Row className="bg-green-500 shadow mb-8">
            <Col>
              <Navbar isSignedIn={this.state.login}/>
            </Col>
          </Row>
          <Switch>
            <Route path="/geocache">
              { redirectIfNotSignedIn(<Geocache contract={this.props.contract} wallet={this.props.wallet}/>)}
            </Route>
            <Route path="/satchel">
              { redirectIfNotSignedIn(<Satchel contract={this.props.contract} wallet={this.props.wallet}/>) }
            </Route>
            <Route path="/create_geocache">
              { redirectIfNotSignedIn(<CreateCache contract={this.props.contract} wallet={this.props.wallet}/>) }
            </Route>
            <Route path="/">
              <Home isSignedIn={this.state.login} requestSignIn={this.requestSignIn}/>
            </Route>
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
