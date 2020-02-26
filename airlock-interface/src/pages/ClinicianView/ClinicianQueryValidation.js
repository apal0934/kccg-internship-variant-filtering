import React, { Component } from "react";

import axios from "axios";
import socketIOClient from "socket.io-client";

export default class ClinicianQueryValidation extends Component {
  state = {
    geneData: [],
    isLoading: true,
    progess: ""
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
    axios.post(url, body).then(res => {
      this.props.parentCallback(false, res.data);
    });
  }

  render() {
    return <div>{this.state.progess}</div>;
  }
}
