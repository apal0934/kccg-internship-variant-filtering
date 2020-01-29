import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import Clinician from "./pages/Clinician";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import React from "react";
import ResearchResult from "./pages/ResearchResult";
import ResearchValidation from "./pages/ResearchValidation";
import Researcher from "./pages/Researcher";

function App() {
  const IP = "localhost";

  return (
    <div>
      <Router>
        <Header />
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/clinician" component={Clinician} />
          <Route
            exact
            path="/researcher"
            render={() => <Researcher IP={IP} />}
          />
          <Route
            exact
            path="/research_validation"
            component={ResearchValidation}
          />
          <Route exact path="/research_result" component={ResearchResult} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
