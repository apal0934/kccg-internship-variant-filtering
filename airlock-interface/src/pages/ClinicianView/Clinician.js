import * as authenticateAnim from "../../animations/782-check-mark-success.json";
import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Button, Card, Form, Layout } from "antd";
import React, { Component } from "react";

import ClinicianQueryForm from "./ClinicianQueryForm.js";
import ClinicianQueryValidation from "./ClinicianQueryValidation";
import ClinicianResult from "./ClinicianResult.js";
import Fade from "react-reveal";
import Lottie from "react-lottie";
import PatientConfirmationForm from "./PatientConfirmation.js";
import PatientForm from "./PatientForm";
import PatientValidation from "./PatientValidation";

const { Content } = Layout;

export class Clinician extends Component {
  state = {
    patientFormCompleted: false,
    queryFormCompleted: false,
    isValidating: false,
    patientFormValues: [],
    queryFormValues: [],
    userData: [],
    mappingData: [],
    geneData: [],
    isAuthenticated: false,
    isAuthenticating: false,
    hasConfirmed: false,
    validationCompleting: true
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  onClick = e => {
    this.setState({
      isAuthenticating: true
    });
  };

  formCallback = (patientFormCompleted, patientFormValues) => {
    this.setState({
      patientFormCompleted: patientFormCompleted,
      patientFormValues: patientFormValues,
      isValidating: true
    });
  };

  patientValidationCallback = (userData, mappingData) => {
    this.setState({
      userData: userData,
      mappingData: mappingData,
      isValidating: false
    });
  };

  confimationCallback = hasConfirmed => {
    this.setState({
      hasConfirmed: hasConfirmed
    });
  };

  queryCallback = (queryFormCompleted, queryFormValues) => {
    this.setState({
      queryFormCompleted: queryFormCompleted,
      queryFormValues: queryFormValues
    });
  };

  queryValidationCallback = (validationCompleting, geneData) => {
    this.setState({
      validationCompleting: validationCompleting,
      geneData: geneData
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
    if (this.state.isAuthenticated && !this.state.patientFormCompleted) {
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
    if (this.state.patientFormCompleted) {
      Element = (
        <div>
          <PatientValidation
            IP={this.props.IP}
            parentCallback={this.patientValidationCallback}
            values={this.state.patientFormValues}
          />
          <div>
            {this.state.isValidating ? (
              <Lottie options={loadingAnimOptions} height={400} width={400} />
            ) : (
              <PatientConfirmationForm
                userData={this.state.userData}
                mappingData={this.state.mappingData}
                parentCallback={this.confimationCallback}
              />
            )}
          </div>
        </div>
      );
    }

    if (this.state.hasConfirmed && !this.state.queryFormCompleted) {
      Element = <ClinicianQueryForm parentCallback={this.queryCallback} />;
    }

    if (this.state.queryFormCompleted) {
      Element = (
        <ClinicianQueryValidation
          IP={this.props.IP}
          formQueryValues={this.state.queryFormValues}
          userData={this.state.userData}
          mappingData={this.state.mappingData}
          parentCallback={this.queryValidationCallback}
        />
      );
    }

    if (!this.state.validationCompleting) {
      Element = (
        <ClinicianResult
          userData={this.state.userData}
          geneData={this.state.geneData}
          gene={this.state.queryFormValues.genes}
        />
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
