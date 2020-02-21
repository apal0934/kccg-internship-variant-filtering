import { Button, Checkbox, Descriptions, Divider, Form } from "antd";
import React, { Component } from "react";

class PatientConfirmation extends Component {
  onSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.parentCallback(true);
      }
    });
  };
  componentDidMount() {}
  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    console.log(this.props.userData);

    return (
      <div>
        <Descriptions
          title="Patient Info"
          layout="vertical"
          size="small"
          bordered
        >
          <Descriptions.Item label="First name">
            {this.props.userData.firstName}
          </Descriptions.Item>
          <Descriptions.Item label="Last name">
            {this.props.userData.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Date of birth">
            {this.props.userData.dateOfBirth.split("T")[0]}
          </Descriptions.Item>
          <Descriptions.Item label="Patient ID">
            {this.props.userData.userId}
          </Descriptions.Item>
          <Descriptions.Item label="Sample ID">
            {this.props.mappingData}
          </Descriptions.Item>
        </Descriptions>
        <Divider>Please review these details</Divider>
        <Form onSubmit={this.onSubmit}>
          <Form.Item>
            {getFieldDecorator("confirm")(
              <Checkbox>I confirm these details to be correct</Checkbox>
            )}
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={!getFieldValue("confirm")}
            >
              Next
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const PatientConfirmationForm = Form.create({
  name: "patient_confirmation_form"
})(PatientConfirmation);
export default PatientConfirmationForm;
