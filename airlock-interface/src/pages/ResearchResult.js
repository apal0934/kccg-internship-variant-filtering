import { Card, Layout, Table } from "antd";
import React, { Component } from "react";
const { Content } = Layout;

export default class ResearchResult extends Component {
  render() {
    const nested = record => {
      const genomeId = record.userId ** 2;
      const data = this.props.location.state.genomeData.genomes.filter(
        genome => {
          return genome.genomeId === genomeId;
        }
      );
      const variants = data[0] ? data[0].variants : [];
      console.log(variants);
      const columns = [
        {
          title: "Name",
          key: "name",
          dataIndex: "name"
        },
        {
          title: "Variant caused HPO terms",
          key: "hpoTerms",
          render: record => (
            <div>
              {record.hpoTerms.map(term => (
                <div>{term}</div>
              ))}
            </div>
          )
        }
      ];

      return (
        <Table columns={columns} dataSource={variants} pagination={false} />
      );
    };

    const columns = [
      {
        title: "First name",
        key: "firstName",
        dataIndex: "firstName"
      },
      {
        title: "Last name",
        key: "lastName",
        dataIndex: "lastName"
      },
      {
        title: "Email",
        key: "email",
        dataIndex: "email"
      }
    ];
    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Query results">
            We found{" "}
            <b>
              {Object.keys(this.props.location.state.userData.users).length}
            </b>{" "}
            consenting samples. <br />
            Of these,{" "}
            <b>
              {Object.keys(this.props.location.state.genomeData.genomes).length}
            </b>{" "}
            have variants matching your query.
          </Card>
        </div>
        <Table
          title={() => "Detailed results (Demo purposes)"}
          dataSource={this.props.location.state.userData.users}
          size="small"
          rowKey="userId"
          pagination={false}
          columns={columns}
          expandedRowRender={nested}
        />
      </Content>
    );
  }
}
