import { Button, DatePicker, Form, Icon, Input } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

class Patient extends Component {
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.parentCallback(true, values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Fade>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <Form.Item
            label="First name"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            validateStatus={""}
            help={""}
          >
            {getFieldDecorator("firstName", {
              rules: [
                {
                  required: true
                }
              ]
            })(
              <Input
                prefix={<Icon type="solution" />}
                placeholder="First name"
              />
            )}
          </Form.Item>
          <Form.Item
            label="Last name"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            validateStatus={""}
            help={""}
          >
            {getFieldDecorator("lastName", {
              rules: [
                {
                  required: true
                }
              ]
            })(
              <Input
                prefix={<Icon type="solution" />}
                placeholder="Last name"
              />
            )}
          </Form.Item>
          <Form.Item
            label="Patient ID"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
            validateStatus={""}
            help={""}
          >
            {getFieldDecorator("ID")(
              <Input
                prefix={<Icon type="solution" />}
                placeholder="Patient ID"
              />
            )}
          </Form.Item>
          <Form.Item
            validateStatus={""}
            help={""}
            label="Date of Birth"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 14 }}
          >
            {getFieldDecorator("dob", {
              rules: [
                {
                  required: true,
                  message: "Date of birth is required"
                }
              ]
            })(<DatePicker placeholder="YYYY-MM-DD" />)}
          </Form.Item>

          <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Fade>
    );
  }
}
const PatientForm = Form.create({ name: "clincian_form" })(Patient);
export default PatientForm;
