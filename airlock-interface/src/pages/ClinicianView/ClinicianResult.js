import { Card, Col, Layout, Row, Statistic, Table } from "antd";
import React, { Component } from "react";

import { CSVLink } from "react-csv";

const { Content } = Layout;

export default class ClinicianResult extends Component {
  state = {
    key: "tab1"
  };

  onTabChange = key => {
    this.setState({
      key: key
    });
  };

  onClick = () => {};

  render() {
    const tabList = [
      {
        key: "tab1",
        tab: "Patient Information"
      },
      {
        key: "tab2",
        tab: "Overview"
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
        dataIndex: "gene"
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "t"
      },
      {
        title: "Allele Freq",
        key: "alleleFreq",
        render: record => <div>{`${(record.af * 100).toFixed(2)}%`}</div>
      },
      {
        title: "HomZ/HetZ",
        key: "homhet",
        render: record => <div>{`${record.homc}/${record.hetc}`}</div>
      },
      {
        title: "Impact",
        key: "impact",
        dataIndex: "impact"
      },
      {
        title: "ClinVar",
        key: "clinvar",
        dataIndex: "clinvar",
        ellipsis: true
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
              value={`${this.props.userData.user.userId}; ${
                this.props.geneData[this.props.geneData.length - 1].samples[0]
              }`}
            />
          </Col>
        </Row>
      ),
      tab2: (
        <Row>
          <Col span={8}>
            <Statistic
              title="Variants"
              value={
                this.props.geneData[this.props.geneData.length - 1].initial
              }
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Filtered to"
              value={
                this.props.geneData[this.props.geneData.length - 1].filtered
              }
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Reduction by a factor of"
              value={Math.round(
                this.props.geneData[this.props.geneData.length - 1].initial /
                  this.props.geneData[this.props.geneData.length - 1].filtered
              )}
            />
          </Col>
        </Row>
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
          <div style={{ paddingTop: 24 }}>
            <Table
              dataSource={this.props.geneData.slice(0, -1)}
              columns={columns}
              rowKey="s"
              title={() => "Variants"}
              footer={() => (
                <CSVLink data={this.props.geneData.slice(0, -1)}>
                  Export CSV
                </CSVLink>
              )}
              bordered
            />
          </div>
        </div>
      </Content>
    );
  }
}
