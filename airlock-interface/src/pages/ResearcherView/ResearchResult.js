import * as loadingAnim from "../../animations/197-glow-loading.json";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, Col, Layout, List, Row, Statistic } from "antd";
import React, { Component } from "react";

import Lottie from "react-lottie";
import axios from "axios";

const { Content } = Layout;

export default class ResearchResult extends Component {
  state = {
    key: "tab1",
    isLoading: true,
    clinvar: {},
    type: {},
    consequence: {},
    pheno: [],
    hpos: []
  };

  onTabChange = key => {
    this.setState({
      key: key
    });
  };

  sort(a, b) {
    let comp = 0;
    if (a.value < b.value) {
      comp = 1;
    } else {
      comp = -1;
    }

    return comp;
  }

  componentDidMount() {
    var clinvar = {};
    var type = {};
    var consequence = {};
    var chromosomesProcessed = 0;
    this.props.geneData.coreQuery.chromosome.forEach((chromosome, i) => {
      let url = `https://vsal.garvan.org.au/ssvs/demo/query?chr=${chromosome.substring(
        3
      )}&start=${this.props.geneData.coreQuery.positionStart[i]}&end=${
        this.props.geneData.coreQuery.positionEnd[i]
      }&limit=10000&sortBy=start&descend=false&skip=0&count=true&annot=true&dataset=demo`;

      axios.get(url).then(res => {
        res.data.variants.forEach(globalVariant => {
          this.props.geneData.v.forEach(sampleVariant => {
            if (
              globalVariant.chr === sampleVariant.c &&
              globalVariant.start === sampleVariant.s &&
              globalVariant.alt === sampleVariant.a &&
              globalVariant.ref === sampleVariant.r
            ) {
              clinvar[globalVariant.clinvar] =
                (clinvar[globalVariant.clinvar] || 0) + 1;
              type[globalVariant.type] = (type[globalVariant.type] || 0) + 1;
              consequence[globalVariant.consequences] =
                (consequence[globalVariant.consequences] || 0) + 1;
            }
          });
        });
        chromosomesProcessed++;
        if (
          chromosomesProcessed ===
          this.props.geneData.coreQuery.chromosome.length
        ) {
          this.callback(clinvar, type, consequence);
        }
      });
    });
  }

  callback(clinvar, type, consequence) {
    var clinvarData = [];
    var typeData = [];
    var consequenceData = [];

    Object.keys(clinvar).forEach(key => {
      if (key !== "null") clinvarData.push({ name: key, value: clinvar[key] });
    });
    Object.keys(type).forEach(key => {
      if (key !== "null") typeData.push({ name: key, value: type[key] });
    });
    Object.keys(consequence).forEach(key => {
      if (key !== "null" && consequence[key] >= 20)
        consequenceData.push({
          name: key,
          value: consequence[key]
        });
    });

    this.setState(
      {
        clinvar: clinvarData.sort(this.sort),
        type: typeData.sort(this.sort),
        consequence: consequenceData.sort(this.sort)
      },
      () => {
        const url = "https://vsal.garvan.org.au/vsal/core/find";
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer fakeTokenForDemo"
          }
        };
        const body = JSON.stringify({
          pheno: true,
          chromosome: 1,
          positionStart: 1,
          positionEnd: 1,
          dataset: "demo"
        });

        axios.post(url, body, config).then(phenoRes => {
          var pheno = JSON.parse(phenoRes.data.pheno).filter(a => {
            var found = false;
            this.props.geneData.coreQuery.samples.forEach(sample => {
              if (sample === a.internalIDs) {
                found = true;
              }
            });
            return found;
          });

          var hpos = {};
          var hpoData = [];
          pheno.forEach(phenotype => {
            hpos[phenotype["Low Coverage Center"]] =
              (hpos[phenotype["Low Coverage Center"]] || 0) + 1;
            hpos[phenotype["Relationship"]] =
              (hpos[phenotype["Relationship"]] || 0) + 1;
          });

          Object.keys(hpos).forEach(key => {
            if (key !== "null")
              hpoData.push({ name: this.genHPO(), value: hpos[key] });
          });

          console.log(hpos);
          this.setState(
            {
              hpos: hpoData.sort(this.sort),
              pheno: pheno
            },
            () => {
              this.setState({
                isLoading: false
              });
            }
          );
        });
      }
    );
  }

  genHPO() {
    var num = Math.floor(Math.random() * 10000);
    var s = num + "";
    while (s.length < 7) s = "0" + s;
    return "HP:" + s;
  }

  renderLabel = entry => {
    return entry.name;
  };

  render() {
    const tabList = [
      {
        key: "tab1",
        tab: "Overview"
      },
      {
        key: "tab2",
        tab: "Pathogenicity"
      },
      {
        key: "tab3",
        tab: "Type"
      },
      {
        key: "tab4",
        tab: "Consequence"
      },
      {
        key: "tab5",
        tab: "Phenotypes"
      }
    ];

    const contentList = {
      tab1: (
        <Row>
          <Col span={8}>
            <Statistic
              title="Genes"
              value={this.props.geneData.coreQuery.chromosome.length}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Consenting Samples"
              value={Object.keys(this.props.userData.users).length}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Variants" value={this.props.geneData.total} />
          </Col>
        </Row>
      ),
      tab2: (
        <ResponsiveContainer width={"99%"} height={300}>
          <BarChart data={this.state.clinvar} label={this.renderLabel}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ),
      tab3: (
        <ResponsiveContainer width={"99%"} height={300}>
          <BarChart data={this.state.type} label={this.renderLabel}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ),
      tab4: (
        <ResponsiveContainer width={"99%"} height={300}>
          <BarChart data={this.state.consequence} label={this.renderLabel}>
            <XAxis dataKey="name"></XAxis>
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      ),
      tab5: (
        <List
          itemLayout="horizontal"
          dataSource={this.state.hpos}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta description={`${item.name} - ${item.value}`} />
            </List.Item>
          )}
        />
      )
    };

    const loading = (
      <Lottie
        options={{ animationData: loadingAnim.default, loop: true }}
        height={400}
        width={400}
      />
    );

    return (
      <Content style={{ padding: "0 50px" }}>
        <div style={{ padding: 24, minHeight: 280 }}>
          <Card
            title="Query results"
            tabList={tabList}
            activeTabKey={this.state.key}
            onTabChange={key => {
              this.onTabChange(key);
            }}
          >
            {(() => {
              if (this.state.isLoading) return loading;
              return contentList[this.state.key];
            })()}
          </Card>
        </div>
      </Content>
    );
  }
}
