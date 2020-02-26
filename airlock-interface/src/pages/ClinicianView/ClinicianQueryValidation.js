import React, { Component } from "react";

import { Steps } from "antd";
import axios from "axios";
import socketIOClient from "socket.io-client";

const { Step } = Steps;

export default class ClinicianQueryValidation extends Component {
  state = {
    geneData: [],
    progess: 0,
    error: false
  };

  componentDidMount() {
    const url = "http://localhost:3001/clinician";
    const body = {
      gene2variantData: {
        samples: [this.props.mappingData],
        geneQuery: {
          regions: this.props.formQueryValues.region,
          genes: this.props.formQueryValues.genes,
          variants: this.props.formQueryValues.variants
        }
      },
      filterData: {
        alleleFreq: this.props.formQueryValues.alleleFreq / 100,
        variantType: this.props.formQueryValues.variantType,
        impact: this.props.formQueryValues.impact,
        operator: this.props.formQueryValues.operator,
        clinvar: "P",
        cadd: this.props.formQueryValues.cadd
      }
    };
    const socket = socketIOClient.connect("http://localhost:3001", {
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
        this.props.parentCallback(false, res.data);
      })
      .catch(error => {
        this.setState({
          error: true
        });
      });
  }

  render() {
    return (
      <div>
        <Steps
          current={this.state.progess}
          status={this.state.error ? "error" : "process"}
        >
          <Step title="Requesting gene locations" description="Chr:Start-End" />
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
      </div>
    );
  }
}
