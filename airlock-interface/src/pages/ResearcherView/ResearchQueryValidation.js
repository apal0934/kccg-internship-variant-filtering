import React, { Component } from "react";

import { Steps } from "antd";
import axios from "axios";
import socketIOClient from "socket.io-client";

const { Step } = Steps;

class ResearchValidation extends Component {
  state = {
    userData: [],
    geneData: [],
    isLoading: true,
    error: false,
    progress: 0
  };

  componentDidMount() {
    const url = "http://" + process.env.REACT_APP_BACKEND_IP + "/researcher";
    const body = {
      consentData: {
        consentOrg: this.props.formIntentionValues.orgType,
        consentPurpose: this.props.formIntentionValues.purpose.map(purpose => {
          return purpose.value;
        }),
        consentHpos: this.props.formIntentionValues.dsx
          ? this.props.formIntentionValues.dsx
          : null
      },
      gene2variantData: {
        geneQuery: {
          regions: this.props.formQueryValues.region,
          genes: this.props.formQueryValues.genes,
          variants: this.props.formQueryValues.variants
        }
      },
      filterData: {
        filter: this.props.formQueryValues.filter,
        alleleFreq: this.props.formQueryValues.alleleFreq / 100,
        variantType: this.props.formQueryValues.variantType,
        impact: this.props.formQueryValues.impact,
        operator: this.props.formQueryValues.operator,
        clinvar: ".*",
        cadd: this.props.formQueryValues.cadd
      }
    };
    const socket = socketIOClient.connect(process.env.REACT_APP_BACKEND_IP, {
      transports: ["websocket"]
    });
    socket.on("progress", data => {
      this.setState({
        progess: data
      });
    });
    axios
      .post(url, body)
      .then(res => {
        this.props.validationCallback(false, null, res.data);
      })
      .catch(err => {
        this.setState({
          error: true
        });
      });
  }

  render() {
    return (
      <Steps
        current={this.state.progess}
        status={this.state.error ? "error" : "process"}
      >
        <Step title="Finding consenting samples" />
        <Step
          title="Requesting variants"
          description="Retrieving from Variant Atlas"
        />
        <Step
          title="Annotating variants with VEP"
          description="This takes a while :("
        />
        <Step title="Finishing up!" description="Processing results" />
      </Steps>
    );
  }
}

export default ResearchValidation;
