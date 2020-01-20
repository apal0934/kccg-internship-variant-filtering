import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import React from "react";
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
            <Route></Route>
            <Route></Route>
            <Route></Route>
          </Switch>
        </Router>
      </div>
    </ApolloProvider>
  );
}

export default App;
