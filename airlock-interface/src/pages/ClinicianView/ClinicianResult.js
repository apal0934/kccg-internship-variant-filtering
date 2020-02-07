import { Card, Layout } from "antd";
import React, { Component } from "react";
const { Content } = Layout;

export default class ClinicianResult extends Component {
  render() {
    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Query results">
            <b>{this.props.userData.user.firstName}</b> has{" "}
            <b>{this.props.geneData.total}</b> variants in the{" "}
            <b>{this.props.gene}</b> gene.
          </Card>
        </div>
      </Content>
    );
  }
}
