import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, Col, Empty, Layout, Row, Statistic } from "antd";
import React, { Component } from "react";

const { Content } = Layout;

export default class ResearchResult extends Component {
  state = {
    key: "tab1"
  };

  onTabChange = key => {
    this.setState({
      key: key
    });
  };

  renderLabel = entry => {
    return entry.name;
  };

  render() {
    const tabList = [
      {
        key: "tab1",
        tab: "Overview"
      },
      {
        key: "tab2",
        tab: "Pathogenicity"
      },
      {
        key: "tab3",
        tab: "Type"
      },
      {
        key: "tab4",
        tab: "Consequence"
      }
    ];

    const contentList = {
      tab1: (
        <Row>
          <Col span={8}>
            <Statistic title="Genes" value={this.props.geneData.stats.genes} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Consenting Samples"
              value={this.props.geneData.stats.samples}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Variants" value={this.props.geneData.filtered} />
          </Col>
        </Row>
      ),
      tab2:
        this.props.geneData.clinvar.length >= 1 ? (
          <ResponsiveContainer width={"99%"} height={300}>
            <BarChart
              data={this.props.geneData.clinvar}
              label={this.renderLabel}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Not enough data found :(" />
        ),
      tab3:
        this.props.geneData.type.length >= 1 ? (
          <ResponsiveContainer width={"99%"} height={300}>
            <BarChart data={this.props.geneData.type} label={this.renderLabel}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Not enough data found :(" />
        ),
      tab4:
        this.props.geneData.consequence.length >= 1 ? (
          <ResponsiveContainer width={"99%"} height={300}>
            <BarChart
              data={this.props.geneData.consequence}
              label={this.renderLabel}
            >
              <XAxis dataKey="name"></XAxis>
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty description="Not enough data found :(" />
        )
    };

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card
            title="Query results"
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={key => {
              this.onTabChange(key);
            }}
          >
            {(() => {
              return contentList[this.state.key];
            })()}
          </Card>
        </div>
      </Content>
    );
  }
}
