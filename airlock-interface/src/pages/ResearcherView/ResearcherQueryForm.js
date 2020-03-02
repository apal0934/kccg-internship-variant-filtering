import {
  AutoComplete,
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Slider
} from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

const { TextArea } = Input;
const AutoCompleteOption = AutoComplete.Option;

class ResearcherQuery extends Component {
  state = {
    autocompleteData: [],
    filter: true
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

  onChange = e => {
    /* TODO: look into seeing if bool can be used here */
    switch (e.target.value) {
      case "yes":
        this.setState({
          filter: true
        });
        break;
      case "no":
        this.setState({
          filter: false
        });
        break;
      default:
        console.log(":(");
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.parentCallback(true, values);
      }
    });
  };

  render() {
    const {
      getFieldDecorator,
      isFieldsTouched,
      getFieldValue
    } = this.props.form;

    const data = this.state.autocompleteData.map(hp => (
      <AutoCompleteOption key={hp.id}>{hp.label}</AutoCompleteOption>
    ));

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Fade>
          <div>
            <Row>
              <Col span={12}>
                <Card type="inner" title="Region">
                  <Form.Item>
                    {getFieldDecorator("region")(
                      <TextArea
                        autoSize
                        placeholder="Enter region or list of regions"
                        disabled={
                          getFieldValue("genes") &&
                          getFieldValue("genes") !== ""
                        }
                      ></TextArea>
                    )}
                  </Form.Item>
                </Card>
              </Col>
              <Col span={12}>
                <Card type="inner" title="Genes">
                  <Form.Item>
                    {getFieldDecorator("genes")(
                      <TextArea
                        autoSize
                        placeholder="Enter gene or list of genes"
                        disabled={
                          getFieldValue("region") &&
                          getFieldValue("region") !== ""
                        }
                      ></TextArea>
                    )}
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </div>

          <h3>Filter variants</h3>
          <Form.Item>
            {getFieldDecorator("filter", {
              initialValue: "yes"
            })(
              <Radio.Group size="large" onChange={this.onChange}>
                <Radio.Button value="yes">Yes</Radio.Button>
                <Radio.Button value="no">No</Radio.Button>
              </Radio.Group>
            )}
          </Form.Item>

          <Row>
            <Col span={24}>
              <Form.Item label="In patients with..." help={""}>
                {getFieldDecorator("hpo")(
                  <AutoComplete
                    dataSource={data}
                    onSearch={this.onSearch}
                    placeholder={"HPO (optional)"}
                    disabled
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <h4>Allele Frequency</h4>
            {getFieldDecorator("alleleFreq", {
              initialValue: 2
            })(
              <Slider
                disabled={!this.state.filter}
                step={0.1}
                max={10}
                tipFormatter={value => {
                  return `${value}%`;
                }}
              />
            )}
          </Form.Item>

          <Form.Item>
            <h4>Minimum CADD Score</h4>
            {getFieldDecorator("cadd", {
              initialValue: 24
            })(<Slider disabled={!this.state.filter} step={1} max={30} />)}
          </Form.Item>

          <Row>
            <Col span={8}>
              <Form.Item>
                <h4>Variant Impact</h4>
                {getFieldDecorator("impact", {
                  initialValue: "highmed"
                })(
                  <Radio.Group disabled={!this.state.filter}>
                    <Radio.Button value="high">High</Radio.Button>
                    <Radio.Button value="highmed">High & Med</Radio.Button>
                    <Radio.Button value="all">All</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <h4>Variant Type</h4>
                {getFieldDecorator("variantType", {
                  initialValue: "both"
                })(
                  <Radio.Group disabled={!this.state.filter}>
                    <Radio.Button value="snp">SNP</Radio.Button>
                    <Radio.Button value="indel">Indel</Radio.Button>
                    <Radio.Button value="both">Both</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item>
                <h4>Filtering Operator - (CADD, Impact, ClinVar)</h4>
                {getFieldDecorator("operator", {
                  initialValue: "or"
                })(
                  <Radio.Group disabled={!this.state.filter}>
                    <Radio.Button value="or">||</Radio.Button>
                    <Radio.Button value="and">&&</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
          </Row>

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
