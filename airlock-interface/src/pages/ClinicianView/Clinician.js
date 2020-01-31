import * as loadingAnim from "../../animations/782-check-mark-success.json";

import { Button, Card, Form, Layout } from "antd";
import React, { Component } from "react";

import ClinicianValidation from "./ClinicianValidation";
import Fade from "react-reveal";
import Lottie from "react-lottie";
import PatientForm from "./PatientForm";

const { Content } = Layout;

export class Clinician extends Component {
  state = {
    formCompleted: false,
    validating: false,
    formValues: [],
    userData: [],
    isAuthenticated: false,
    isAuthenticating: false
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  onClick = e => {
    this.setState({
      isAuthenticating: true
    });
  };

  formCallback = (formCompleted, formValues) => {
    this.setState({
      formCompleted: formCompleted,
      formValues: formValues,
      validating: true
    });
  };

  validationCallback = userData => {
    this.setState({
      userData: userData,
      validating: false
    });
  };

  render() {
    const defaultOptions = {
      animationData: loadingAnim.default,
      loop: false
    };

    var Element;
    // Show form if "auth"ed and form not completed
    if (this.state.isAuthenticated && !this.state.formCompleted) {
      Element = <PatientForm parentCallback={this.formCallback} />;
    }
    // Show auth button if not auth'd
    if (!this.state.isAuthenticated) {
      Element = (
        <Button type="primary" onClick={this.onClick}>
          Authenticate
        </Button>
      );
    }
    // Show animation while authing
    if (this.state.isAuthenticating) {
      Element = (
        <Lottie
          options={defaultOptions}
          height={400}
          width={400}
          eventListeners={[
            {
              eventName: "complete",
              callback: () =>
                this.setState({
                  isAuthenticated: true,
                  isAuthenticating: false
                })
            }
          ]}
        />
      );
    }
    // Validate patient details and show results
    if (this.state.formCompleted) {
      Element = (
        <div>
          <ClinicianValidation
            IP={this.props.IP}
            validationCallback={this.validationCallback}
            values={this.state.formValues}
          />
          <div>
            {this.state.validating ? "ree" : this.state.userData.user.firstName}
          </div>
        </div>
      );
    }

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Clinician View">
            <Fade>{Element}</Fade>
          </Card>
        </div>
      </Content>
    );
  }
}

const ClinicianForm = Form.create({ name: "clincian_form" })(Clinician);
export default ClinicianForm;
