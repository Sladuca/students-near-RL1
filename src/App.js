import 'bootstrap/dist/css/bootstrap.min.css';
import 'regenerator-runtime/runtime';
import React, { Component } from 'react';
import Geocache from './components/geocache';
import Satchel from './components/satchel';
import Navbar from './components/navbar';
import Home from './components/home';
import CreateCache from './components/createCache';
import { Container, Row, Col, Button } from 'react-bootstrap';
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
      satchel: [],
    }
    this.signedInFlow = this.signedInFlow.bind(this);
    this.requestSignIn = this.requestSignIn.bind(this);
    this.requestSignOut = this.requestSignOut.bind(this);
    this.signedOutFlow = this.signedOutFlow.bind(this);
    this.getGeodes = this.getGeodes.bind(this);
    }

  componentDidMount() {
    let loggedIn = this.props.wallet.isSignedIn();
    if (loggedIn) {
      this.signedInFlow();
      this.getGeodes();
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

  async getGeodes() {
    // get geode id's
    const ids = await this.props.contract.get_geode_ids_by_owner({ owner: window.accountId }) || [];
    // fetch geode structs concurrently
    const geodePromises = ids.map(id => this.props.contract.get_geode({ geode_id: id }));
    const geodes = await Promise.all(geodePromises);
    this.setState({
      ...this.state,
      satchel: geodes.map((geode, i) => ({ ...geode, id: ids[i] }))
    });
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
              { redirectIfNotSignedIn(<Geocache contract={this.props.contract} wallet={this.props.wallet} getGeodes={this.getGeodes} satchel={this.state.satchel}/>)}
            </Route>
            <Route path="/satchel">
              { redirectIfNotSignedIn(<Satchel contract={this.props.contract} wallet={this.props.wallet} getGeodes={this.getGeodes} satchel={this.state.satchel}/>) }
            </Route>
            <Route path="/create_geocache">
              { redirectIfNotSignedIn(<CreateCache contract={this.props.contract} wallet={this.props.wallet}/>) }
            </Route>
            <Route path="/">
              <Home isSignedIn={this.state.login} requestSignIn={this.requestSignIn}/>
            </Route>
          </Switch>
          {
            this.state.login ? (
              <div className="flex flex-row justify-center my-8">
                <Button onMouseUp={() => this.requestSignOut()}>Sign Out</Button>
              </div>
            ) : (
              <div className="flex flex-row justify-center my-8">
                <Button onMouseUp={async () => await this.requestSignIn()}>Sign In</Button>
              </div>
            )
          }
          
        </Container>
      </Router>
    );
  }
}

export default App;
