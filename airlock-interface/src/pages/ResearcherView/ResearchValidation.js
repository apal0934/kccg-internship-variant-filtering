import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import { InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";

class ResearchValidation extends Component {
  state = {
    userData: [],
    genomeData: [],
    loading: true
  };

  componentDidMount() {
    const cache = new InMemoryCache();
    const clientConsent = new ApolloClient({
      cache,
      uri: `http://${this.props.IP}:8000`
    });
    const clientGenome = new ApolloClient({
      cache,
      uri: `http://${this.props.IP}:9000`
    });
    clientConsent
      .query({
        query: gql`
          query UserQuery(
            $consentOrg: Int
            $consentPurpose: [String]
            $consentHpo: Int
          ) {
            users(
              consentOrg: $consentOrg
              consentPurpose: $consentPurpose
              consentHpo: $consentHpo
            ) {
              userId
              firstName
              lastName
              email
            }
          }
        `,
        variables: {
          consentOrg: this.props.values.orgType,
          consentPurpose: this.props.values.purpose.map(purpose => {
            return purpose.value;
          }),
          consentHpo: 1
        }
      })
      .then(resultConsent => {
        const genome_ids = this.mapUserToGenome(resultConsent.data.users);
        clientGenome
          .query({
            query: gql`
              query GenomeQuery($genomeIds: [Int], $variantIds: [String]) {
                genomes(genomeIds: $genomeIds, variantIds: $variantIds) {
                  genomeId
                  variants {
                    name
                    hpoTerms
                  }
                }
              }
            `,
            variables: {
              genomeIds: genome_ids,
              variantIds: this.props.values.hpo
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
        this.props.validationCallback(
          false,
          this.state.userData,
          this.state.genomeData
        );
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
    return <Fragment />;
  }
}

export default ResearchValidation;
