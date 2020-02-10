import { Button, Form, Select, TreeSelect } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

const { Option } = Select;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ResearcherIntention extends Component {
  state = {
    tOrgType: false,
    tPurpose: false
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  /* Show purpose field only when orgType is selected */
  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      if (this.props.form.isFieldTouched("orgType")) {
        this.setState({
          tOrgType: true
        });
      }
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(["orgType", "purpose"], (err, values) => {
      if (!err) {
        this.props.parentCallback(true, values);
      }
    });
  };

  render() {
    const treeData = [
      {
        title: "General research use [GRU]",
        value: "DUO:0000042",
        key: "DUO:0000042",
        children: [
          {
            title: "General research use and clinical care",
            value: "DUO:0000005",
            key: "DUO:0000005",
            children: [
              {
                title: "Health/Medical/Biomedial research [HMB]",
                value: "DUO:0000006",
                key: "DUO:0000006",
                children: [
                  {
                    title: "Disease specific research [DS-XX]",
                    value: "DUO:0000007",
                    key: "DUO:0000007"
                  }
                ]
              }
            ]
          },
          {
            title: "Population origins or ancestry research [POA]",
            value: "DUO:0000011",
            key: "DUO:0000011"
          }
        ]
      }
    ];

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Form
        layout="horizontal"
        onSubmit={this.handleSubmit}
        {...this.props.formItemLayout}
      >
        <Fade>
          <Form.Item label="I am a..." help={""}>
            {getFieldDecorator("orgType", {
              rules: [
                {
                  required: true
                }
              ]
            })(
              <Select
                placeholder="Select organisation type"
                style={{ width: 250 }}
              >
                <Option value="1">Not-for-profit research</Option>
                <Option value="2">University or research institute</Option>
                <Option value="3">Government</Option>
                <Option value="4">Commercial company</Option>
              </Select>
            )}
          </Form.Item>
        </Fade>

        <Fade when={this.state.tOrgType} collapse>
          <Form.Item label="Requesting access for..." help={""}>
            {getFieldDecorator("purpose", {
              rules: [
                {
                  required: true
                }
              ]
            })(
              <TreeSelect
                treeData={treeData}
                treeCheckable
                treeCheckStrictly
                treeDefaultExpandAll
                onSelect={this.onSelect}
              />
            )}
          </Form.Item>
        </Fade>

        <Fade>
          <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={hasErrors(getFieldsError(["orgType", "purpose"]))}
            >
              Next (
              {
                Object.values(getFieldsError(["orgType", "purpose"])).filter(
                  v => !v
                ).length
              }
              /2)
            </Button>
          </Form.Item>
        </Fade>
      </Form>
    );
  }
}

const ResearcherIntentionForm = Form.create({
  name: "research_intention_form"
})(ResearcherIntention);
export default ResearcherIntentionForm;
