import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import axios from "axios";
import gql from "graphql-tag";

class ResearchValidation extends Component {
  state = {
    userData: [],
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    /* 
    Instantiate ApolloClients for 
    1. Dynamic Consent (8000)
    2. GeneTrustee (7000)
    */
    const clientConsent = new ApolloClient({
      uri: `http://${this.props.IP}:8000`
    });
    const clientGenome = new ApolloClient({
      uri: `http://${this.props.IP}:7000`
    });
    /* Select only the users that have consented to the researcher's purpose and orgType */
    clientConsent
      .query({
        query: gql`
          query UserQuery(
            $consentOrg: Int
            $consentPurpose: [String]
            $consentHpos: [String]
          ) {
            users(
              consentOrg: $consentOrg
              consentPurpose: $consentPurpose
              consentHpos: $consentHpos
            ) {
              userId
              firstName
              lastName
              email
            }
          }
        `,
        variables: {
          consentOrg: this.props.formIntentionValues.orgType,
          consentPurpose: this.props.formIntentionValues.purpose.map(
            purpose => {
              return purpose.value;
            }
          ),
          consentHpos: this.props.formIntentionValues.dsx
            ? this.props.formIntentionValues.dsx
            : null
        }
      })
      .then(resultConsent => {
        /* Map those consenting users to their Genome (sample) IDs */
        clientGenome
          .query({
            query: gql`
              query GenomeQuery($userIds: [Int]) {
                usersToGenomes(userIds: $userIds) {
                  userId
                  genomeId
                }
              }
            `,
            variables: {
              userIds: resultConsent.data.users.map(user => {
                return user.userId;
              })
            }
          })
          .then(resultGenome => {
            /* Use KCCG's gene elasticsearch to translate gene names to genome positions */
            const url =
              "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
            const config = {
              headers: {
                "Content-Type": "application/json"
              }
            };
            const lines = this.props.formQueryValues.genes
              ? this.props.formQueryValues.genes.split(/\r\n|\r|\n/)
              : [];
            const numGenes = lines.length;
            const body = JSON.stringify({
              from: 0,
              size: numGenes,
              query: {
                dis_max: {
                  queries: [
                    {
                      match: {
                        symbol: {
                          query: this.props.formQueryValues.genes || "",
                          fuzziness: 1,
                          boost: 4
                        }
                      }
                    }
                  ],
                  tie_breaker: 0.4
                }
              },
              sort: [{ _score: { order: "desc" } }]
            });

            axios.post(url, body, config).then(searchResult => {
              /* If genes found, sort into CSVs of Chromosome, Position Start/End
                 Otherwise, assume region was given.
                 Region in format chromosome:start-end, split into CSVs as above */
              var chromosome;
              var positionStart;
              var positionEnd;

              if (searchResult.data.hits.hits[0]) {
                chromosome = searchResult.data.hits.hits
                  .map(genes => {
                    return genes._source.chromosome;
                  })
                  .join(",");

                positionStart = searchResult.data.hits.hits
                  .map(genes => {
                    return genes._source.start;
                  })
                  .join(",");

                positionEnd = searchResult.data.hits.hits
                  .map(genes => {
                    return genes._source.end;
                  })
                  .join(",");
              } else {
                const regionLines = this.props.formQueryValues.region.split(
                  /\r\n|\r|\n/
                );

                chromosome = regionLines
                  .map(region => {
                    return region.split(":")[0];
                  })
                  .join(",");

                positionStart = regionLines
                  .map(region => {
                    return region.split(":")[1].split("-")[0];
                  })
                  .join(",");

                positionEnd = regionLines
                  .map(region => {
                    return region.split(":")[1].split("-")[1];
                  })
                  .join(",");
              }

              const url = "https://vsal.garvan.org.au/vsal/core/find";
              const config = {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer fakeTokenForDemo"
                }
              };

              const body = JSON.stringify({
                chromosome: chromosome,
                positionStart: positionStart,
                positionEnd: positionEnd,
                limit: "10000",
                skip: 0,
                samples: resultGenome.data.usersToGenomes
                  .map(sample => {
                    return sample.genomeId;
                  })
                  .join(","),
                dataset: "demo"
              });

              axios.post(url, body, config).then(variantResult => {
                this.setState({
                  userData: resultConsent.data,
                  geneData: variantResult.data
                });
              });
            });
          });
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState && this.state.isLoading) {
      if (this.state.userData.users) {
        this.setState(
          {
            isLoading: false
          },
          () => {
            this.props.validationCallback(
              false,
              this.state.userData,
              this.state.geneData
            );
          }
        );
      }
    }
  }

  render() {
    return <Fragment />;
  }
}

export default ResearchValidation;
