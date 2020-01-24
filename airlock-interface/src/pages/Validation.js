import { Card, Layout, Table } from "antd";
import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";

const { Content } = Layout;

class Validation extends Component {
  state = {
    userData: [],
    genomeData: [],
    loading: true,
    fromResearcher: true
  };

  componentDidMount() {
    const cache = new InMemoryCache();
    const clientConsent = new ApolloClient({
      cache,
      uri: `http://${this.props.location.state.IP}:8000`
    });
    const clientGenome = new ApolloClient({
      cache,
      uri: `http://${this.props.location.state.IP}:9000`
    });
    clientConsent
      .query({
        query: gql`{
                users(consentOrg: ${this.props.location.state.orgType}, consentPurpose: ${this.props.location.state.purpose}, consentHpo: ${this.props.location.state.hpo}) {
                    userId
                    firstName
                    lastName
                    email
                }
            }`
      })
      .then(resultConsent => {
        const genome_ids = this.mapUserToGenome(resultConsent.data.users);
        clientGenome
          .query({
            query: gql`
              query GenomeQuery($genomeIds: [Int], $variantId: Int) {
                genomes(genomeIds: $genomeIds, variantId: $variantId) {
                  genomeId
                  variants
                }
              }
            `,
            variables: {
              genomeIds: genome_ids,
              variantId: this.props.location.state.hpo
            }
          })
          .then(resultGenome => {
            this.setState({
              userData: resultConsent.data,
              genomeData: resultGenome.data
            });
          });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState && this.state.loading) {
      if (this.state.userData.users) {
        this.setState({
          loading: false
        });
      }
    }
  }

  mapUserToGenome(userIds) {
    let genome_ids = [];
    userIds.forEach(consent => {
      genome_ids.push(consent.userId ** 2);
    });
    return genome_ids;
  }

  render() {
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
    if (this.state.loading) return <h1>Loading...</h1>;
    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Query results">
            We found <b>{Object.keys(this.state.userData.users).length}</b>{" "}
            consenting samples. <br />
            Of these, <b>
              {Object.keys(this.state.genomeData.genomes).length}
            </b>{" "}
            have variants matching your query.
          </Card>
        </div>
        <Table
          title={() => "Detailed results (Demo purposes)"}
          dataSource={this.state.userData.users}
          size="small"
          rowKey="userId"
          pagination={false}
          columns={columns}
        />
      </Content>
    );
  }
}

export default Validation;
