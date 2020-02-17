import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Card, Col, Layout, Row, Statistic, Table } from "antd";
import React, { Component } from "react";

import Lottie from "react-lottie";

const { Content } = Layout;

export default class ClinicianResult extends Component {
  state = {
    key: "tab1",
    isLoading: true,
    filtered: []
  };

  componentDidMount() {
    console.log(this.props.userData);
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

  onTabChange = key => {
    this.setState({
      key: key
    });
  };

  render() {
    const loadingAnimOptions = {
      animationData: loadingAnim.default,
      loop: true
    };

    if (this.state.isLoading) {
      return <Lottie options={loadingAnimOptions} height={400} width={400} />;
    }

    const tabList = [
      {
        key: "tab1",
        tab: "Patient Information"
      },
      {
        key: "tab2",
        tab: "Overview"
      },
      {
        key: "tab3",
        tab: "Variants"
      }
    ];

    const columns = [
      {
        title: "Variant",
        key: "variant",
        render: record => (
          <div>{`${record.c}:${record.s}${record.r}>${record.a}`}</div>
        ),
        ellipsis: true
      },
      {
        title: "Gene",
        key: "gene",
        render: record => <div>Placeholder</div>
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "t"
      }
    ];

    const contentList = {
      tab1: (
        <Row>
          <Col span={8}>
            <Statistic
              title="Name"
              value={`${this.props.userData.user.firstName} ${this.props.userData.user.lastName}`}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Date of Birth"
              value={this.props.userData.user.dateOfBirth.split("T")[0]}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="IDs"
              value={`${this.props.userData.user.userId}; ${this.props.geneData.coreQuery.samples[0]}`}
            />
          </Col>
        </Row>
      ),
      tab2: (
        <Row>
          <Col span={8}>
            <Statistic title="Variants" value={this.props.geneData.total} />
          </Col>
          <Col span={8}>
            <Statistic title="Filtered to" value={this.state.filtered.length} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Reduction"
              value={`${(1 -
                (
                  this.state.filtered.length / this.props.geneData.total
                ).toFixed(2)) *
                100}%`}
            />
          </Col>
        </Row>
      ),
      tab3: (
        <Table dataSource={this.state.filtered} columns={columns} rowKey="s" />
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
