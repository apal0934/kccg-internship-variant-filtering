import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import gql from "graphql-tag";

export default class PatientValidation extends Component {
  state = {
    isLoading: true,
    userData: [],
    mappingData: []
  };

  componentDidMount() {
    /* 
      Instantiate ApolloClients for 
      1. Dynamic Consent (8000)
      2. GeneTrustee (7000)
    */
    const userClient = new ApolloClient({
      uri: `http://${this.props.IP}:8000`
    });
    const mappingClient = new ApolloClient({
      uri: `http://${this.props.IP}:7000`
    });

    /* Select patient from details given */
    userClient
      .query({
        query: gql`
          query UserQuery(
            $firstName: String
            $lastName: String
            $dateOfBirth: String
          ) {
            user(
              firstName: $firstName
              lastName: $lastName
              dateOfBirth: $dateOfBirth
            ) {
              userId
              firstName
              lastName
              email
              dateOfBirth
            }
          }
        `,
        variables: {
          firstName: this.props.values.firstName,
          lastName: this.props.values.lastName,
          dateOfBirth: this.props.values.dob._d.getTime()
        }
      })
      .then(userResult => {
        /* Retrieve their genomeID */
        mappingClient
          .query({
            query: gql`
              query mappingQuery($userId: Int) {
                userToGenome(userId: $userId) {
                  genomeId
                }
              }
            `,
            variables: {
              userId: userResult.data.user.userId
            }
          })
          .then(mappingResult => {
            this.setState({
              userData: userResult.data,
              mappingData: mappingResult.data
            });
          });
      });
  }

  componentDidUpdate(prevState) {
    if (this.state !== prevState && this.state.isLoading) {
      if (this.state.userData.user) {
        this.setState({
          isLoading: false
        });
        this.props.parentCallback(this.state.userData, this.state.mappingData);
      }
    }
  }

  render() {
    return <Fragment />;
  }
}
