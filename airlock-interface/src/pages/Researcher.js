import { Button, Card, Form, Icon, Input, Layout, Select } from "antd";
import React, { Component } from "react";

import FormItem from "antd/lib/form/FormItem";
import { Redirect } from "react-router-dom";

const { Option } = Select;
const { Content } = Layout;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

export class Researcher extends Component {
    state = {
        completed: false,
        values: []
    };

    componentDidMount() {
        this.props.form.validateFields();
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
        if (this.state.completed) {
            return (
                <Redirect
                    to={{
                        pathname: "/researcher/2",
                        state: {
                            orgType: this.state.values.orgType,
                            hpo: this.state.values.hpo,
                            purpose: this.state.values.purpose
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
                                        <Option value="1">
                                            Not-for-profit research
                                        </Option>
                                        <Option value="2">
                                            University or research institute
                                        </Option>
                                        <Option value="3">Government</Option>
                                        <Option value="4">
                                            Commercial company
                                        </Option>
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
                                })(
                                    <Select
                                        placeholder="Select HPO"
                                        style={{ width: 250 }}
                                    >
                                        <Option value="1">Cancer</Option>
                                        <Option value="2">Blood</Option>
                                        <Option value="3">Rare disease</Option>
                                        <Option value="4">Deformities</Option>
                                    </Select>
                                )}
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
                                    <Select
                                        placeholder="Select purpose"
                                        style={{ width: 270 }}
                                    >
                                        <Option value="1">
                                            General research and clinical use
                                        </Option>
                                        <Option value="2">
                                            Health/Medical/Biomedical research
                                        </Option>
                                        <Option value="3">
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
