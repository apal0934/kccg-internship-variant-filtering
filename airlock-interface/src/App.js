import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import Clinician from "./pages/ClinicianView/Clinician";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import React from "react";
import Researcher from "./pages/ResearcherView/Researcher";

function App() {
  const IP = "localhost";

  return (
    <div>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/clinician" render={() => <Clinician IP={IP} />} />
          <Route
            exact
            path="/researcher"
            render={() => <Researcher IP={IP} />}
          />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
