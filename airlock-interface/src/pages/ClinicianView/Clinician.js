import * as authenticateAnim from "../../animations/782-check-mark-success.json";
import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Button, Card, Descriptions, Form, Layout } from "antd";
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
    const authAnimOptions = {
      animationData: authenticateAnim.default,
      loop: false
    };
    const loadingAnimOptions = {
      animationData: loadingAnim.default,
      loop: true
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
          options={authAnimOptions}
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
            {this.state.validating ? (
              <Lottie options={loadingAnimOptions} height={400} width={400} />
            ) : (
              <Descriptions title="Patient Info">
                <Descriptions.Item label="First name">
                  {this.state.userData.user.firstName}
                </Descriptions.Item>
                <Descriptions.Item label="Last name">
                  {this.state.userData.user.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Date of birth">
                  {this.state.userData.user.dateOfBirth.split("T")[0]}
                </Descriptions.Item>
                <Descriptions.Item label="Patient ID">
                  {this.state.userData.user.userId}
                </Descriptions.Item>
                <Descriptions.Item label="Genome ID">
                  {this.state.userData.user.userId ** 2}
                </Descriptions.Item>
              </Descriptions>
            )}
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
