import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { Fragment } from "react";
import gql from "graphql-tag";

export default class ClinicianValidation extends Component {
  state = {
    loading: true,
    userData: []
  };

  componentDidMount() {
    console.log(this.props.values.dateOfBirth);
    const client = new ApolloClient({
      uri: `http://${this.props.IP}:8000`
    });
    client
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
      .then(result => {
        this.setState({
          userData: result.data
        });
      });
  }

  componentDidUpdate(prevState) {
    if (this.state !== prevState && this.state.loading) {
      if (this.state.userData.user) {
        this.setState({
          loading: false
        });
        this.props.validationCallback(false, this.state.userData);
      }
    }
  }

  render() {
    return <Fragment />;
  }
}
