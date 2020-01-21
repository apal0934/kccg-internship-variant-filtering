import { Card, Layout, Table } from "antd";
import React, { Component } from "react";

import ApolloClient from "apollo-boost";
import { InMemoryCache } from "apollo-boost";
import gql from "graphql-tag";

const { Content } = Layout;

class Validation extends Component {
    state = {
        data: [],
        loading: true,
        fromResearcher: true
    };

    componentDidMount() {
        const cache = new InMemoryCache();
        const client = new ApolloClient({
            cache,
            uri: `http://${this.props.location.state.IP}:8000`
        });
        client
            .query({
                query: gql`{
                users(consentOrg: ${this.props.location.state.orgType}, consentPurpose: ${this.props.location.state.purpose}, consentHpo: ${this.props.location.state.hpo}) {
                    id
                    firstName
                    lastName
                    email
                }
            }`
            })
            .then(result =>
                this.setState({
                    data: result.data
                })
            );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state !== prevState && this.state.loading) {
            if (this.state.data.users) {
                this.setState({
                    loading: false
                });
            }
        }
    }

    render() {
        const columns = [
            {
                title: "First name",
                key: "firstName",
                dataIndex: "firstName"
            },
            {
                title: "Last name",
                key: "lastName",
                dataIndex: "lastName"
            },
            {
                title: "Email",
                key: "email",
                dataIndex: "email"
            }
        ];
        if (this.state.loading) return <h1>Loading...</h1>;
        return (
            <Content style={{ padding: "0 50px" }}>
                <div style={{ padding: 24, minHeight: 280 }}>
                    <Card title="Query results">
                        We found{" "}
                        <b>{Object.keys(this.state.data.users).length}</b>{" "}
                        consenting samples
                    </Card>
                </div>
                <Table
                    title={() => "Detailed results (Demo purposes)"}
                    dataSource={this.state.data.users}
                    size="small"
                    pagination={false}
                    columns={columns}
                />
            </Content>
        );
    }
}

export default Validation;
