import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Slider,
  Spin
} from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";
import axios from "axios";
import debounce from "lodash/debounce";

const { TextArea } = Input;
const { Option } = Select;

class ClinicianQuery extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.onSearch = debounce(this.onSearch, 800);
  }
  state = {
    autocompleteData: [],
    hpoGenes: [],
    fetching: false,
    custom: false
  };

  onSearch = query => {
    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ autocompleteData: [], fetching: true });

    let url = `https://api.monarchinitiative.org/api/search/entity/autocomplete/${query}?category=phenotype&prefix=HP&rows=5&start=0&minimal_tokenizer=false`;
    axios.get(url).then(res => {
      if (fetchId !== this.lastFetchId) {
        return;
      }
      this.setState({
        autocompleteData: res.data.docs,
        fetching: false
      });
    });
  };

  onSelect = query => {
    let url = `https://api.monarchinitiative.org/api/bioentity/phenotype/${query.key}/genes?rows=100&facet=false&unselect_evidence=false&exclude_automatic_assertions=false&fetch_objects=false&use_compact_associations=true&direct=false&direct_taxon=false`;

    axios.get(url).then(response => {
      /* Use KCCG's gene elasticsearch to translate gene names to genome positions */
      url = "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
      const config = {
        headers: {
          "Content-Type": "application/json"
        }
      };

      var genes = [];
      response.data.compact_associations.forEach(association => {
        association.objects.forEach(gene => {
          if (gene.startsWith("HGNC")) {
            genes.push(gene.substring(5));
          }
        });
      });

      const numGenes = genes.length;
      const body = {
        from: 0,
        size: numGenes,
        query: {
          dis_max: {
            queries: [
              {
                match: {
                  description: {
                    query: genes.join(" "),
                    fuzziness: 1,
                    boost: 4
                  }
                }
              }
            ],
            tie_breaker: 0.4
          }
        },
        sort: [{ _score: { order: "desc" } }]
      };

      axios.post(url, body, config).then(res => {
        const geneCSV = res.data.hits.hits
          .map(gene => {
            return gene._source.symbol;
          })
          .join(",");
        const prevCSV = this.props.form.getFieldValue("genes");

        this.props.form.setFieldsValue({
          genes: prevCSV ? prevCSV + "," + geneCSV : geneCSV
        });

        this.setState({
          autocompleteData: [],
          fetching: false
        });
      });
    });
  };

  onChange = e => {
    switch (e.target.value) {
      case "default":
        this.props.form.setFieldsValue({
          alleleFreq: 2,
          impact: "highmed",
          cadd: 24
        });
        this.setState({
          custom: false
        });
        break;
      case "rachel":
        this.props.form.setFieldsValue({
          alleleFreq: 1.5,
          impact: "high",
          cadd: 20
        });
        this.setState({
          custom: false
        });
        break;
      case "custom":
        this.setState({
          custom: true
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

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Fade>
          <Row>
            <Col span={24}>
              <Form.Item label="Patient has phenotype..." help={""}>
                {getFieldDecorator("hpo")(
                  <Select
                    mode="multiple"
                    labelInValue
                    placeholder={"HPO (optional)"}
                    notFoundContent={
                      this.state.fetching ? <Spin size="small" /> : null
                    }
                    filterOption={false}
                    onSearch={this.onSearch}
                    onSelect={query => this.onSelect(query)}
                  >
                    {this.state.autocompleteData.map(hp => (
                      <Option key={hp.id}>{hp.label}</Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>

          <div>
            <Row>
              <Col span={12}>
                <Card type="inner" title="Region - Chr:Start-End">
                  <Form.Item>
                    {getFieldDecorator("region")(
                      <TextArea
                        autoSize
                        placeholder="Enter region or list of regions (CSV)"
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
                        placeholder="Enter gene or list of genes (CSV)"
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

          <h3>Bucket Settings</h3>
          <Form.Item>
            {getFieldDecorator("settings", {
              initialValue: "default"
            })(
              <Radio.Group size="large" onChange={this.onChange}>
                <Radio.Button value="default">Recommended Orrery</Radio.Button>
                <Radio.Button value="rachel">Rachel's Settings</Radio.Button>
                <Radio.Button value="custom">Custom</Radio.Button>
              </Radio.Group>
            )}
          </Form.Item>

          <Form.Item>
            <h4>Allele Frequency</h4>
            {getFieldDecorator("alleleFreq", {
              initialValue: 2
            })(
              <Slider
                disabled={!this.state.custom}
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
            })(<Slider disabled={!this.state.custom} step={1} max={30} />)}
          </Form.Item>

          <Row>
            <Col span={6}>
              <Form.Item>
                <h4>Variant Impact</h4>
                {getFieldDecorator("impact", {
                  initialValue: "highmed"
                })(
                  <Radio.Group disabled={!this.state.custom}>
                    <Radio.Button value="high">High</Radio.Button>
                    <Radio.Button value="highmed">High & Med</Radio.Button>
                    <Radio.Button value="all">All</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <h4>Variant Type</h4>
                {getFieldDecorator("variantType", {
                  initialValue: "both"
                })(
                  <Radio.Group disabled={!this.state.custom}>
                    <Radio.Button value="snp">SNP</Radio.Button>
                    <Radio.Button value="indel">Indel</Radio.Button>
                    <Radio.Button value="both">Both</Radio.Button>
                  </Radio.Group>
                )}
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <h4>Filtering Operator - (CADD, Impact, ClinVar)</h4>
                {getFieldDecorator("operator", {
                  initialValue: "or"
                })(
                  <Radio.Group disabled={!this.state.custom}>
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

const ClinicianQueryForm = Form.create({ name: "clinician_query_form" })(
  ClinicianQuery
);
export default ClinicianQueryForm;
