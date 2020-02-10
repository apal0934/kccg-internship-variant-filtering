import * as authenticateAnim from "../../animations/782-check-mark-success.json";
import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Button, Card, Layout } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";
import Lottie from "react-lottie";
import ResearchIntentionForm from "./ResearcherIntentionForm";
import ResearchResult from "./ResearchResult";
import ResearchValidation from "./ResearchQueryValidation";
import ResearcherQueryForm from "./ResearcherQueryForm.js";

const { Content } = Layout;

export default class Researcher extends Component {
  state = {
    isAuthenticated: false,
    isAuthenticating: false,
    isIntentionCompleted: false,
    isQueryCompleted: false,
    isValidating: true,
    formIntentionValues: [],
    formQueryValues: [],
    userData: [],
    genomeData: []
  };

  /* When query has come back with results */
  validationCallback = (isValidating, userData, geneData) => {
    this.setState({
      isValidating: isValidating,
      userData: userData,
      geneData: geneData
    });
  };

  /* When form for research purpose has been submitted */
  intentionFormCallback = (isCompleted, formValues) => {
    this.setState({
      isIntentionCompleted: isCompleted,
      formIntentionValues: formValues
    });
  };

  /* When form for query has been submitted */
  queryFormCallback = (isCompleted, formValues) => {
    this.setState({
      isQueryCompleted: isCompleted,
      formQueryValues: formValues
    });
  };

  /* Placeholder auth */
  handleAuthentication = e => {
    this.setState({
      isAuthenticating: true
    });
  };

  render() {
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      }
    };

    /* Execute query and display results */
    const validationAndDisplay = (
      <div>
        <ResearchValidation
          IP={this.props.IP}
          formIntentionValues={this.state.formIntentionValues}
          formQueryValues={this.state.formQueryValues}
          validationCallback={this.validationCallback}
        />
        {this.state.isValidating ? (
          <Lottie
            options={{ animationData: loadingAnim.default, loop: true }}
            height={400}
            width={400}
          />
        ) : (
          <Fade>
            <ResearchResult
              userData={this.state.userData}
              geneData={this.state.geneData}
            />
          </Fade>
        )}
      </div>
    );

    /* Fake authentication button */
    const authButton = (
      <Button type="primary" onClick={this.handleAuthentication}>
        Authenticate
      </Button>
    );

    const authAnim = (
      <Lottie
        options={{ animationData: authenticateAnim.default, loop: false }}
        height={400}
        width={400}
        eventListeners={[
          {
            eventName: "complete",
            callback: () => {
              this.setState({
                isAuthenticated: true,
                isAuthenticating: false
              });
            }
          }
        ]}
      />
    );

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Researcher View">
            {(() => {
              if (!this.state.isAuthenticated && !this.state.isAuthenticating) {
                return authButton;
              } else if (this.state.isAuthenticating) {
                return authAnim;
              } else if (!this.state.isIntentionCompleted) {
                return (
                  <ResearchIntentionForm
                    parentCallback={this.intentionFormCallback}
                    formItemLayout={formItemLayout}
                  />
                );
              } else if (!this.state.isQueryCompleted) {
                return (
                  <ResearcherQueryForm
                    parentCallback={this.queryFormCallback}
                    formItemLayout={formItemLayout}
                  />
                );
              } else {
                return validationAndDisplay;
              }
            })()}
          </Card>
        </div>
      </Content>
    );
  }
}
