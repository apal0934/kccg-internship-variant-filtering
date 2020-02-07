import { AutoComplete, Button, Card, Col, Form, Input, Row } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

const { TextArea } = Input;
const AutoCompleteOption = AutoComplete.Option;

class ClinicianQuery extends Component {
  state = {
    autocompleteData: []
  };

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
    if (query.length >= 3) this.search(query);
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(
      ["variants", "genes", "region", "hpo"],
      (err, values) => {
        if (!err) {
          this.props.parentCallback(true, values);
        }
      }
    );
  };

  render() {
    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    const data = this.state.autocompleteData.map(hp => (
      <AutoCompleteOption key={hp.obo_id}>{hp.label}</AutoCompleteOption>
    ));

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
  }
}

const ClinicianQueryForm = Form.create({ name: "clinician_query_form" })(
  ClinicianQuery
);
export default ClinicianQueryForm;
