import { AutoComplete, Button, Card, Col, Form, Input, Row } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

const { TextArea } = Input;
const AutoCompleteOption = AutoComplete.Option;

class ResearcherQuery extends Component {
  state = {
    autocompleteData: []
  };

  /* GET request to EBI for HPO autocomplete suggestions */
  search(query) {
    let url = `https://api.monarchinitiative.org/api/search/entity/autocomplete/${query}?category=phenotype&prefix=HP&rows=5&start=0&minimal_tokenizer=false`;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = () => {
      let status = xhr.status;
      if (status === 200) {
        this.setState({
          autocompleteData: xhr.response.docs
        });
      }
    };
    xhr.send();
  }

  /* 
  Don't spam them with requests
  Only send on substantial strings, and every second letter
  */
  onSearch = query => {
    if (query.length >= 3 && query.length % 2 === 0) this.search(query);
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
      <AutoCompleteOption key={hp.id}>{hp.highlight}</AutoCompleteOption>
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

const ResearcherQueryForm = Form.create({ name: "researcher_query_form" })(
  ResearcherQuery
);
export default ResearcherQueryForm;
