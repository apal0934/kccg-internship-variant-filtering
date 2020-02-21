import React, { Component } from "react";

import { Fragment } from "react";
import axios from "axios";

export default class PatientValidation extends Component {
  componentDidMount() {
    const url = "http://localhost:3001/p2s";
    const body = {
      firstName: this.props.values.firstName,
      lastName: this.props.values.lastName,
      dateOfBirth: this.props.values.dob._d.getTime()
    };

    axios.post(url, body).then(res => {
      if (!res.data.error) {
        this.props.parentCallback(res.data.user, res.data.mapping);
      } else {
        this.props.parentCallback(false, false);
      }
    });
  }

  render() {
    return <Fragment />;
  }
}
