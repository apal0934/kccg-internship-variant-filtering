import { AutoComplete, Button, Card, Form, Layout, Select } from "antd";
import React, { Component } from "react";

import FormItem from "antd/lib/form/FormItem";
import { Redirect } from "react-router-dom";

const { Option } = Select;
const { Content } = Layout;
const AutoCompleteOption = AutoComplete.Option;
function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export class Researcher extends Component {
  state = {
    completed: false,
    values: [],
    value: "",
    autocompleteData: []
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  search(query) {
    let url = `https://www.ebi.ac.uk/ols/api/select?ontology=hp&q=${query}`;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = () => {
      let status = xhr.status;
      if (status === 200) {
        this.setState({
          autocompleteData: xhr.response.response.docs
        });
      }
    };
    xhr.send();
  }

  onSearch = query => {
    this.search(query);
  };

  onSelect = val => {
    this.setState({
      value: val
    });
  };

  renderItem(item, isHighlighted) {
    return (
      <div style={{ background: isHighlighted ? "lightgray" : "white" }}>
        {item.label}
      </div>
    );
  }

  getItemValue(item) {
    return item.obo_id;
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.setState({
          completed: true,
          values: values
        });
      }
    });
  };

  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      isFieldTouched
    } = this.props.form;
    const data = this.state.autocompleteData.map(hp => (
      <AutoCompleteOption key={hp.obo_id}>{hp.label}</AutoCompleteOption>
    ));
    if (this.state.completed) {
      return (
        <Redirect
          to={{
            pathname: "/research_validation",
            state: {
              orgType: this.state.values.orgType,
              hpo: this.state.values.hpo,
              purpose: this.state.values.purpose,
              IP: this.props.IP
            }
          }}
        />
      );
    }
    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Researcher View">
            <Form layout="horizontal" onSubmit={this.handleSubmit}>
              <Form.Item
                label="I am a..."
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                validateStatus={""}
                help={""}
              >
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
              <Form.Item
                label="Looking at..."
                labelCol={{ span: 4 }}
                hidden={!isFieldTouched("orgType")}
                wrapperCol={{ span: 14 }}
                validateStatus={""}
                help={""}
              >
                {getFieldDecorator("hpo", {
                  rules: [
                    {
                      required: true
                    }
                  ]
                })(<AutoComplete dataSource={data} onSearch={this.onSearch} />)}
              </Form.Item>

              <Form.Item
                label="For..."
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 14 }}
                hidden={!isFieldTouched("hpo")}
                validateStatus={""}
                help={""}
              >
                {getFieldDecorator("purpose", {
                  rules: [
                    {
                      required: true
                    }
                  ]
                })(
                  <Select placeholder="Select purpose" style={{ width: 270 }}>
                    <Option value="DUO:0000005">
                      General research and clinical use
                    </Option>
                    <Option value="DUO:0000006">
                      Health/Medical/Biomedical research
                    </Option>
                    <Option value="DUO:0000007">
                      Disease specific research
                    </Option>
                    <Option value="DUO:0000011">
                      Population and Ancestry research
                    </Option>
                  </Select>
                )}
              </Form.Item>
              <FormItem wrapperCol={{ span: 14, offset: 4 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={hasErrors(getFieldsError())}
                >
                  Next
                </Button>
              </FormItem>
            </Form>
          </Card>
        </div>
      </Content>
    );
  }
}
const ResearcherForm = Form.create({ name: "researcher_form" })(Researcher);
export default ResearcherForm;
