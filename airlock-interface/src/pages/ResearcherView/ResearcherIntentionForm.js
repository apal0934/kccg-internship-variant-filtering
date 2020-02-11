import { AutoComplete, Button, Form, Select, TreeSelect } from "antd";
import React, { Component } from "react";

import Fade from "react-reveal";

const { Option } = Select;
const AutoCompleteOption = AutoComplete.Option;
function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class ResearcherIntention extends Component {
  state = {
    tOrgType: false,
    tPurpose: false,
    tDSX: false,
    autocompleteData: []
  };

  componentDidMount() {
    this.props.form.validateFields();
  }

  search(query) {
    const url = `https://api.monarchinitiative.org/api/search/entity/autocomplete/${query}?category=phenotype&prefix=HP&rows=5&start=0&minimal_tokenizer=false`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = () => {
      const status = xhr.status;
      if (status === 200) {
        this.setState({
          autocompleteData: xhr.response.docs
        });
      }
    };
    xhr.send();
  }

  /* Don't spam them with requests, only send every second letter */
  onSearch = query => {
    if (query.length % 2 === 0) this.search(query);
  };

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

  /* If DS-XX is chosen, show DS-XX input, else remove */
  onChange = e => {
    var dsx = false;
    e.forEach(selection => {
      if (selection.value === "DUO:0000007") {
        dsx = true;
      }
    });
    this.setState(
      {
        tDSX: dsx
      },
      () => {
        this.props.form.validateFields(["dsx"], { force: true });
      }
    );
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields(
      ["orgType", "purpose", "dsx"],
      (err, values) => {
        if (!err) {
          this.props.parentCallback(true, values);
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

    const data = this.state.autocompleteData.map(disease => (
      <AutoCompleteOption key={disease.id}>
        {disease.label[0]}
      </AutoCompleteOption>
    ));

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
                onChange={this.onChange}
              />
            )}
          </Form.Item>
        </Fade>

        <Fade when={this.state.tDSX} collapse>
          <Form.Item label="The disease researched is...">
            {getFieldDecorator("dsx", {
              rules: [
                {
                  required: this.state.tDSX
                }
              ]
            })(
              <AutoComplete
                dataSource={data}
                onSearch={this.onSearch}
                placeholder="Disease (required)"
              />
            )}
          </Form.Item>
        </Fade>

        <Fade>
          <Form.Item wrapperCol={{ span: 14, offset: 4 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={hasErrors(
                getFieldsError(["orgType", "purpose", "dsx"])
              )}
            >
              Next (
              {
                Object.values(
                  this.state.tDSX
                    ? getFieldsError(["orgType", "purpose", "dsx"])
                    : getFieldsError(["orgType", "purpose"])
                ).filter(v => !v).length
              }
              /{this.state.tDSX ? 3 : 2})
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
