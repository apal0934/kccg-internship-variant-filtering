import "./App.css";

import { Route, HashRouter as Router, Switch } from "react-router-dom";

import Clinician from "./pages/Clinician";
import Header from "./components/Header";
import Landing from "./pages/Landing";
import React from "react";
import Researcher from "./pages/Researcher";
import Validation from "./pages/Validation";

function App() {
    const IP = "172.21.78.131";

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
                    <Route exact path="/validation" component={Validation} />
                </Switch>
            </Router>
        </div>
    );
}

export default App;
