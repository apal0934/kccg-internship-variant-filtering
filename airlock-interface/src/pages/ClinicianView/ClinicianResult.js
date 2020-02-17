import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Card, Layout } from "antd";
import React, { Component } from "react";

import Lottie from "react-lottie";

const { Content } = Layout;

export default class ClinicianResult extends Component {
  state = {
    isLoading: true,
    filtered: []
  };
  componentDidMount() {
    var alleleFilter = this.props.geneData.v.filter(gene => {
      return gene.af <= this.props.form.alleleFreq / 100;
    });
    var typeFilter = alleleFilter.filter(gene => {
      switch (this.props.form.variantType) {
        case "both":
          return true;
        case "snp":
          return gene.t === "SNV";
        case "indel":
          return gene.t === "INS" || gene.t === "DEL";
        default:
          return false;
      }
    });
    this.setState({
      filtered: typeFilter,
      isLoading: false
    });
  }

  render() {
    const loadingAnimOptions = {
      animationData: loadingAnim.default,
      loop: true
    };

    if (this.state.isLoading) {
      return <Lottie options={loadingAnimOptions} height={400} width={400} />;
    }

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Query results">
            <b>{this.props.userData.user.firstName}</b> has{" "}
            <b>{this.props.geneData.total}</b> variants in the{" "}
            <b>{this.props.form.genes}</b> gene(s).
            <br />
            Based on your criteria, these have been filtered down to{" "}
            <b>{this.state.filtered.length}</b> variants.
          </Card>
        </div>
      </Content>
    );
  }
}
