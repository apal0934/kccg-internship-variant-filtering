import React, { Component } from "react";

import { Fragment } from "react";
import axios from "axios";

class ResearchValidation extends Component {
  state = {
    userData: [],
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    const url = "http://localhost:3001/researcher";
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
      }
    };
    axios.post(url, body).then(res => {
      this.props.validationCallback(false, null, res.data);
    });
  }

  render() {
    return <Fragment />;
  }
}

export default ResearchValidation;
