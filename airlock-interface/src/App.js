import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import Clinician from "./pages/ClinicianView/Clinician";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import { Layout } from "antd";
import React from "react";
import Researcher from "./pages/ResearcherView/Researcher";

const { Footer } = Layout;

function App() {
  return (
    <div>
      <Router>
        <Layout style={{ minHeight: "100vh" }}>
          <Header />
          <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/clinician" render={() => <Clinician />} />
            <Route exact path="/researcher" render={() => <Researcher />} />
          </Switch>
          <Footer style={{ textAlign: "center" }}>Proof of Concept Only</Footer>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
