import {
  AutoComplete,
  Button,
  Card,
  Form,
  Icon,
  Layout,
  Select,
  Spin,
  TreeSelect
} from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";
import ResearchResult from "./ResearchResult";
import ResearchValidation from "./ResearchValidation";

const { Option } = Select;
const { Content } = Layout;
const AutoCompleteOption = AutoComplete.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export class Researcher extends Component {
  state = {
    formCompleted: false,
    formValues: [],
    autocompleteData: [],
    tOrgType: false,
    tHpo: false,
    validating: false,
    userData: [],
    genomeData: []
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      if (this.props.form.isFieldTouched("orgType")) {
        this.setState({
          tOrgType: true
        });
      }
    }
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

  validationCallback = (validating, userData, genomeData) => {
    this.setState({
      validating: validating,
      userData: userData,
      genomeData: genomeData
    });
  };

  onSearch = query => {
    this.search(query);
  };

  onSelect = val => {
    this.setState({
      tHpo: true
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
          formCompleted: true,
          formValues: values,
          validating: true
        });
      }
    });
  };
  // TODO: Change redirect to direct components
  render() {
    const loading = (
      <Icon
        type="loading"
        style={{
          fontSize: "64px",
          position: "absolute",
          left: "50%",
          justifyContent: "center"
        }}
      />
    );

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
    const data = this.state.autocompleteData.map(hp => (
      <AutoCompleteOption key={hp.obo_id}>{hp.label}</AutoCompleteOption>
    ));

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Researcher View">
            {this.state.formCompleted ? (
              <div>
                <ResearchValidation
                  IP={this.props.IP}
                  values={this.state.formValues}
                  validationCallback={this.validationCallback}
                />
                {this.state.validating ? (
                  <Spin indicator={loading} />
                ) : (
                  <Fade>
                    <ResearchResult
                      userData={this.state.userData}
                      genomeData={this.state.genomeData}
                    />
                  </Fade>
                )}
              </div>
            ) : (
              <Form layout="horizontal" onSubmit={this.handleSubmit}>
                <Fade>
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
                        <Option value="2">
                          University or research institute
                        </Option>
                        <Option value="3">Government</Option>
                        <Option value="4">Commercial company</Option>
                      </Select>
                    )}
                  </Form.Item>
                </Fade>
                <Fade when={this.state.tOrgType} collapse>
                  <Form.Item
                    label="Looking at..."
                    labelCol={{ span: 4 }}
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
                    })(
                      <AutoComplete
                        onSelect={this.onSelect}
                        dataSource={data}
                        onSearch={this.onSearch}
                      />
                    )}
                  </Form.Item>
                </Fade>

                <Fade when={this.state.tHpo} collapse>
                  <Form.Item
                    label="For..."
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 14 }}
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
                      <TreeSelect
                        treeData={treeData}
                        treeCheckable
                        treeCheckStrictly
                        treeDefaultExpandAll
                      />
                    )}
                  </Form.Item>
                </Fade>
                <Fade>
                  <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={hasErrors(getFieldsError())}
                    >
                      Next (
                      {Object.values(getFieldsError()).filter(v => !v).length}
                      /3)
                    </Button>
                  </Form.Item>
                </Fade>
              </Form>
            )}
          </Card>
        </div>
      </Content>
    );
  }
}

const ResearcherForm = Form.create({ name: "researcher_form" })(Researcher);
export default ResearcherForm;
