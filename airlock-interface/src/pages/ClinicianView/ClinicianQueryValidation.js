import React, { Component } from "react";

import { Fragment } from "react";
import axios from "axios";

export default class ClinicianQueryValidation extends Component {
  state = {
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    const url = "http://localhost:3001/clinician";
    const body = {
      gene2variantData: {
        samples: [this.props.mappingData.userToGenome.genomeId],
        geneQuery: {
          regions: this.props.formQueryValues.region,
          genes: this.props.formQueryValues.genes,
          variants: this.props.formQueryValues.variants
        }
      },
      filterData: {
        alleleFreq: this.props.formQueryValues.alleleFreq,
        variantType: this.props.formQueryValues.variantType,
        impact: this.props.formQueryValues.impact,
        clinvar: this.props.formQueryValues.clinvar
      }
    };

    axios.post(url, body).then(res => {
      this.props.parentCallback(false, res.data);
    });
  }

  render() {
    return <Fragment />;
  }
}
