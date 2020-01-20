import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import Clinician from "./pages/Clinician";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import React from "react";
import Researcher from "./pages/Researcher";
import logo from "./logo.svg";

const client = new ApolloClient({
  uri: "http://localhost:8000"
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <Router>
          <Header />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/clinician" component={Clinician} />
            <Route exact path="/researcher" component={Researcher} />
          </Switch>
        </Router>
      </div>
    </ApolloProvider>
  );
}

export default App;
