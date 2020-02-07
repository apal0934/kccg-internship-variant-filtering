import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import gql from "graphql-tag";

export default class PatientValidation extends Component {
  state = {
    loading: true,
    userData: [],
    mappingData: []
  };

  componentDidMount() {
    console.log(this.props.values.dateOfBirth);
    const userClient = new ApolloClient({
      uri: `http://${this.props.IP}:8000`
    });
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
        const mappingClient = new ApolloClient({
          uri: `http://${this.props.IP}:7000`
        });
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
    if (this.state !== prevState && this.state.loading) {
      if (this.state.userData.user) {
        this.setState({
          loading: false
        });
        this.props.parentCallback(this.state.userData, this.state.mappingData);
      }
    }
  }

  render() {
    return <Fragment />;
  }
}
