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
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://varsome.com/variant/hg19/${record.Existing_variation}`}
          >{`${record.Location}${record.REF_ALLELE}>${record.Allele}`}</a>
        ),
        ellipsis: true
      },
      {
        title: "Gene",
        key: "gene",
        render: record => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://omim.org/search/?index=entry&start=1&search=${record.SYMBOL}&sort=score+desc%2C+prefix_sort+desc&limit=10&field=approved_gene_symbol`}
          >
            {record.SYMBOL}
          </a>
        )
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "VARIANT_CLASS"
      },
      {
        title: "Allele Freq",
        key: "alleleFreq",
        render: record => (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://gnomad.broadinstitute.org/variant/${record.Location.replace(
              ":",
              "-"
            )}-${record.REF_ALLELE}-${record.Allele}?dataset=gnomad_r2_1`}
          >{`${(record.AF * 100).toFixed(2)}%`}</a>
        )
      },
      {
        title: "Impact",
        key: "impact",
        dataIndex: "IMPACT"
      },
      {
        title: "ClinVar",
        key: "clinvar",
        render: record => (
          <a
            href={`https://www.ncbi.nlm.nih.gov/snp/${record.Existing_variation}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {record.ClinVar_CLNSIG}
          </a>
        ),
        ellipsis: true
      },
      {
        title: "CADD",
        key: "cadd",
        dataIndex: "CADD_PHRED"
      },
      {
        title: "Associated diseases (if any)",
        key: "dsx",
        render: record => {
          record.ClinVar_CLNDN.split("|").map(disease => {
            if (disease !== "not_provided" || disease !== "not_specified") {
              return <div>disease</div>;
            }
            return null;
          });
        }
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
