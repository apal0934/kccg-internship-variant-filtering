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
          <div>{`${record["#Location"]}${record.REF_ALLELE}>${record.Allele}`}</div>
        ),
        ellipsis: true
      },
      {
        title: "Gene",
        key: "gene",
        dataIndex: "SYMBOL"
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "VARIANT_CLASS"
      },
      {
        title: "Allele Freq",
        key: "alleleFreq",
        render: record => <div>{`${(record.AF * 100).toFixed(2)}%`}</div>
      },
      {
        title: "Impact",
        key: "impact",
        dataIndex: "IMPACT"
      },
      {
        title: "ClinVar",
        key: "clinvar",
        dataIndex: "CLIN_SIG",
        ellipsis: true
      },
      {
        title: "CADD",
        key: "cadd",
        dataIndex: "CADD_PHRED"
      }
    ];

    const contentList = {
      tab1: (
        <Row>
          <Col span={8}>
            <Statistic
              title="Name"
              value={`${this.props.userData.firstName} ${this.props.userData.lastName}`}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Date of Birth"
              value={this.props.userData.dateOfBirth.split("T")[0]}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="IDs"
              value={`${this.props.userData.userId}; ${
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
