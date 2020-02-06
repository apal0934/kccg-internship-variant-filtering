import { Card, Layout } from "antd";
import React, { Component } from "react";
const { Content } = Layout;

export default class ResearchResult extends Component {
  render() {
    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Query results">
            We found <b>{Object.keys(this.props.userData.users).length}</b>{" "}
            consenting samples. <br />
            In total, there are <b>{this.props.geneData.total}</b> variants
            present in your query.
          </Card>
        </div>
      </Content>
    );
  }
}
