import * as authenticateAnim from "../../animations/782-check-mark-success.json";
import * as loadingAnim from "../../animations/197-glow-loading.json";

import {
  AutoComplete,
  Button,
  Card,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Select,
  TreeSelect
} from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";
import Lottie from "react-lottie";
import ResearchResult from "./ResearchResult";
import ResearchValidation from "./ResearchValidation";

const { TextArea } = Input;
const { Option } = Select;
const { Content } = Layout;
const AutoCompleteOption = AutoComplete.Option;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export class Researcher extends Component {
  state = {
    isAuthenticated: false,
    isAuthenticating: false,
    formStage1Completed: false,
    formStage2Completed: false,
    formStage1Values: [],
    formStage2Values: [],
    autocompleteData: [],
    tOrgType: false,
    tPurpose: false,
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

  validationCallback = (validating, userData, geneData) => {
    this.setState({
      validating: validating,
      userData: userData,
      geneData: geneData
    });
  };

  onSearch = query => {
    this.search(query);
  };

  onSelect = val => {
    this.setState({
      tPurpose: true
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

  handleAuthentication = e => {
    this.setState({
      isAuthenticating: true
    });
  };

  handleStage1Submit = e => {
    e.preventDefault();
    this.props.form.validateFields(["orgType", "purpose"], (err, values) => {
      if (!err) {
        this.setState({
          formStage1Completed: true,
          formStage1Values: values
        });
      } else {
        console.log(err);
      }
    });
  };

  handleStage2Submit = e => {
    e.preventDefault();
    this.props.form.validateFields(
      ["variants", "genes", "region", "hpo"],
      (err, values) => {
        if (!err) {
          this.setState({
            formStage2Completed: true,
            validating: true,
            formStage2Values: values
          });
        }
      }
    );
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

    const {
      getFieldDecorator,
      getFieldsError,
      isFieldsTouched
    } = this.props.form;
    const data = this.state.autocompleteData.map(hp => (
      <AutoCompleteOption key={hp.obo_id}>{hp.label}</AutoCompleteOption>
    ));

    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 14
      }
    };

    const validationAndDisplay = (
      <div>
        <ResearchValidation
          IP={this.props.IP}
          stage1Values={this.state.formStage1Values}
          stage2Values={this.state.formStage2Values}
          validationCallback={this.validationCallback}
        />
        {this.state.validating ? (
          <Lottie
            options={{ animationData: loadingAnim.default, loop: true }}
            height={400}
            width={400}
          />
        ) : (
          <Fade>
            <ResearchResult
              userData={this.state.userData}
              geneData={this.state.geneData}
            />
          </Fade>
        )}
      </div>
    );

    const formStage1 = (
      <Form
        layout="horizontal"
        onSubmit={this.handleStage1Submit}
        {...formItemLayout}
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

    const formStage2 = (
      <Form layout="horizontal" onSubmit={this.handleStage2Submit}>
        <Fade>
          <div>
            <Row>
              <Col span={8}>
                <Card type="inner" title="Region">
                  <Form.Item>
                    {getFieldDecorator("region")(
                      <TextArea
                        autoSize
                        placeholder="Enter region or list of regions"
                      ></TextArea>
                    )}
                  </Form.Item>
                </Card>
              </Col>
              <Col span={8}>
                <Card type="inner" title="Genes">
                  <Form.Item>
                    {getFieldDecorator("genes")(
                      <TextArea
                        autoSize
                        placeholder="Enter gene or list of genes"
                      ></TextArea>
                    )}
                  </Form.Item>
                </Card>
              </Col>

              <Col span={8}>
                <Card type="inner" title="Variants">
                  <Form.Item>
                    {getFieldDecorator("variants")(
                      <TextArea
                        autoSize
                        placeholder="Enter variant or list of variants"
                      ></TextArea>
                    )}
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </div>
        </Fade>

        <Fade>
          <Row>
            <Col span={24}>
              <Form.Item label="In patients with..." help={""}>
                {getFieldDecorator("hpo")(
                  <AutoComplete
                    dataSource={data}
                    onSearch={this.onSearch}
                    placeholder={"HPO (optional)"}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Fade>

        <Fade>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={
                !isFieldsTouched(["region", "hpo", "genes", "variants"])
              }
            >
              Next
            </Button>
          </Form.Item>
        </Fade>
      </Form>
    );

    const authButton = (
      <Button type="primary" onClick={this.handleAuthentication}>
        Authenticate
      </Button>
    );

    const authAnim = (
      <Lottie
        options={{ animationData: authenticateAnim.default, loop: false }}
        height={400}
        width={400}
        eventListeners={[
          {
            eventName: "complete",
            callback: () => {
              this.setState({
                isAuthenticated: true,
                isAuthenticating: false
              });
            }
          }
        ]}
      />
    );

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card title="Researcher View">
            {(() => {
              if (!this.state.isAuthenticated && !this.state.isAuthenticating) {
                return authButton;
              } else if (this.state.isAuthenticating) {
                return authAnim;
              } else if (!this.state.formStage1Completed) {
                return formStage1;
              } else if (!this.state.formStage2Completed) {
                return formStage2;
              } else {
                return validationAndDisplay;
              }
            })()}
          </Card>
        </div>
      </Content>
    );
  }
}

const ResearcherForm = Form.create({ name: "researcher_form" })(Researcher);
export default ResearcherForm;
