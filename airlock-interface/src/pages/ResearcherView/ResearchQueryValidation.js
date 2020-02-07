import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import { InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";

class ResearchValidation extends Component {
  state = {
    userData: [],
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    const cache = new InMemoryCache();
    const clientConsent = new ApolloClient({
      cache,
      uri: `http://${this.props.IP}:8000`
    });
    const clientGenome = new ApolloClient({
      cache,
      uri: `http://${this.props.IP}:7000`
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
          consentOrg: this.props.formIntentionValues.orgType,
          consentPurpose: this.props.formIntentionValues.purpose.map(
            purpose => {
              return purpose.value;
            }
          ),
          consentHpo: 1
        }
      })
      .then(resultConsent => {
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
            console.log(resultGenome);
            let searchUrl =
              "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
            let searchXhr = new XMLHttpRequest();
            searchXhr.open("POST", searchUrl, true);
            searchXhr.setRequestHeader("Content-Type", "application/json");
            searchXhr.onload = () => {
              let status = searchXhr.status;
              if (status === 200) {
                const searchResult = JSON.parse(searchXhr.response);
                console.log(searchResult);
                let queryUrl = "https://vsal.garvan.org.au/vsal/core/find";
                let queryXhr = new XMLHttpRequest();
                queryXhr.open("POST", queryUrl, true);
                queryXhr.setRequestHeader("Content-Type", "application/json");
                queryXhr.setRequestHeader(
                  "Authorization",
                  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2djL2Nhbm55VG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW1Gc1pYaEFjbWwyYVM1cGJ5SXNJbWxrSWpvaVoyOXZaMnhsTFc5aGRYUm9Nbnd4TVRZeU5qVXpOamM1TnpFME16STVPRE13TURRaUxDSnVZVzFsSWpvaVlXeGxlQ0lzSW1saGRDSTZNVFU0TURrMk5EYzJOQ3dpWlhod0lqb3hOVGd4TURBd056WTBmUS5LREZ1S2t5RGRpYU1RaU9mYWR4Uml0ejdld2cyUTVxM1BqR1JpeHBXbEtnIiwiaHR0cHM6Ly9zZ2MuZ2FydmFuLm9yZy5hdS9jbGFpbXMvcGVybWlzc2lvbnMiOltdLCJlbWFpbCI6ImFsZXhAcml2aS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL3NnYy5hdS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTYyNjUzNjc5NzE0MzI5ODMwMDQiLCJhdWQiOiJlUzJIQTZhU1lueENYRnZvOWJ6SHBWMURJNkgxeXcwbCIsImlhdCI6MTU4MDk2NDc2NSwiZXhwIjoxNTgwOTcxOTY1LCJhdF9oYXNoIjoiMXlBemhkWmFVMTVzcHRSZGJKeTFJQSIsIm5vbmNlIjoiSX5vdUs0cEdSQlNWeXQxZHcwazlfWjAxRnRCdHhmNlQifQ.FLdqceJ86QRY4-SaPm711Wwo6PjjB3ZvTFpJkZJXewM"
                );
                queryXhr.onload = () => {
                  let status = queryXhr.status;
                  if (status === 200) {
                    this.setState({
                      userData: resultConsent.data,
                      geneData: JSON.parse(queryXhr.response)
                    });
                    console.log(JSON.parse(queryXhr.response));
                  } else {
                    console.log(status);
                  }
                };
                queryXhr.send(
                  JSON.stringify({
                    chromosome: searchResult.hits.hits[0]
                      ? searchResult.hits.hits[0]._source.chromosome
                      : this.props.formQueryValues.region.split(":")[0],
                    positionStart: searchResult.hits.hits[0]
                      ? searchResult.hits.hits[0]._source.start
                      : this.props.formQueryValues.region
                          .split(":")[1]
                          .split("-")[0],
                    positionEnd: searchResult.hits.hits[0]
                      ? searchResult.hits.hits[0]._source.end
                      : this.props.formQueryValues.region
                          .split(":")[1]
                          .split("-")[1],
                    limit: "10000",
                    skip: 0,
                    samples: resultGenome.data.usersToGenomes
                      .map(mapping => {
                        return mapping.genomeId;
                      })
                      .join(","),
                    dataset: "demo"
                  })
                );
              }
            };
            searchXhr.send(
              JSON.stringify({
                from: 0,
                size: 5,
                query: {
                  dis_max: {
                    queries: [
                      {
                        match: {
                          id: {
                            query: this.props.formQueryValues.genes || ""
                          }
                        }
                      },
                      {
                        match_phrase_prefix: {
                          symbol: {
                            query: this.props.formQueryValues.genes || "",
                            max_expansions: 20,
                            boost: 2
                          }
                        }
                      },
                      {
                        match: {
                          symbol: {
                            query: this.props.formQueryValues.genes || "",
                            fuzziness: 1,
                            boost: 2
                          }
                        }
                      },
                      {
                        match: {
                          description: {
                            query: this.props.formQueryValues.genes || "",
                            fuzziness: 1
                          }
                        }
                      }
                    ],
                    tie_breaker: 0.4
                  }
                },
                sort: [{ _score: { order: "desc" } }]
              })
            );
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
