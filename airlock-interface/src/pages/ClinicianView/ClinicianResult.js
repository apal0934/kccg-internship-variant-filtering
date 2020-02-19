import * as loadingAnim from "../../animations/197-glow-loading.json";

import { Card, Col, Layout, Row, Statistic, Table } from "antd";
import React, { Component } from "react";

import Lottie from "react-lottie";
import axios from "axios";

const { Content } = Layout;

export default class ClinicianResult extends Component {
  state = {
    key: "tab1",
    isLoading: true,
    filtered: []
  };

  impactEnum = {
    transcript_ablation: "HIGH",
    splice_acceptor_variant: "HIGH",
    splice_donor_variant: "HIGH",
    stop_gained: "HIGH",
    frameshift_variant: "HIGH",
    stop_lost: "HIGH",
    start_lost: "HIGH",
    transcript_amplification: "HIGH",
    inframe_insertion: "MODERATE",
    inframe_deletion: "MODERATE",
    missense_variant: "MODERATE",
    protein_altering_variant: "MODERATE",
    splice_region_variant: "LOW",
    incomplete_terminal_codon_variant: "LOW",
    start_retained_variant: "LOW",
    stop_retained_variant: "LOW",
    synonymous_variant: "LOW",
    coding_sequence_variant: "MODIFIER",
    mature_miRNA_variant: "MODIFIER",
    "5_prime_UTR_variant": "MODIFIER",
    "3_prime_UTR_variant": "MODIFIER",
    non_coding_transcript_exon_variant: "MODIFIER",
    intron_variant: "MODIFIER",
    NMD_transcript_variant: "MODIFIER",
    non_coding_transcript_variant: "MODIFIER",
    upstream_gene_variant: "MODIFIER",
    downstream_gene_variant: "MODIFIER",
    TFBS_ablation: "MODIFIER",
    TFBS_amplification: "MODIFIER",
    TF_binding_site_variant: "MODIFIER",
    regulatory_region_ablation: "MODIFIER",
    regulatory_region_amplification: "MODIFIER",
    feature_elongation: "MODIFIER",
    regulatory_region_variant: "MODIFIER",
    feature_truncation: "MODIFIER",
    intergenic_variant: "MODIFIER"
  };

  componentDidMount() {
    console.log(this.props.userData);
    var filtered = this.props.geneData.v
      .filter(gene => {
        return gene.af <= this.props.form.alleleFreq / 100;
      })
      .filter(gene => {
        switch (this.props.form.variantType) {
          case "both":
            return true;
          case "snp":
            return gene.t === "SNV";
          case "indel":
            return gene.t === "INS" || gene.t === "DEL";
          default:
            return false;
        }
      });

    var chromosomesProcessed = 0;
    this.props.geneData.coreQuery.chromosome.forEach((chromosome, i) => {
      let url = `https://vsal.garvan.org.au/ssvs/demo/query?chr=${chromosome.substring(
        3
      )}&start=${this.props.geneData.coreQuery.positionStart[i]}&end=${
        this.props.geneData.coreQuery.positionEnd[i]
      }&limit=10000&sortBy=start&descend=false&skip=0&count=true&annot=true&dataset=demo`;

      axios.get(url).then(res => {
        res.data.variants.forEach(globalVariant => {
          filtered.forEach(sampleVariant => {
            if (
              globalVariant.chr === sampleVariant.c &&
              globalVariant.start === sampleVariant.s &&
              globalVariant.alt === sampleVariant.a &&
              globalVariant.ref === sampleVariant.r
            ) {
              sampleVariant["impact"] = this.impactEnum[
                globalVariant.consequences
              ];
            }
          });
        });
        chromosomesProcessed++;
        if (
          chromosomesProcessed ===
          this.props.geneData.coreQuery.chromosome.length
        ) {
          filtered = filtered.filter(gene => {
            switch (this.props.form.impact) {
              case "all":
                return gene.impact !== "MODIFIER" || gene.impact !== undefined;
              case "high":
                return gene.impact === "HIGH";
              case "highmed":
                return gene.impact === "HIGH" || gene.impact === "MEDIUM";
              default:
                return false;
            }
          });

          this.setState({
            filtered: filtered,
            isLoading: false
          });
        }
      });
    });
  }

  onTabChange = key => {
    this.setState({
      key: key
    });
  };

  render() {
    const loadingAnimOptions = {
      animationData: loadingAnim.default,
      loop: true
    };

    if (this.state.isLoading) {
      return <Lottie options={loadingAnimOptions} height={400} width={400} />;
    }

    const tabList = [
      {
        key: "tab1",
        tab: "Patient Information"
      },
      {
        key: "tab2",
        tab: "Overview"
      },
      {
        key: "tab3",
        tab: "Variants"
      }
    ];

    const columns = [
      {
        title: "Variant",
        key: "variant",
        render: record => (
          <div>{`${record.c}:${record.s}${record.r}>${record.a}`}</div>
        ),
        ellipsis: true
      },
      {
        title: "Gene",
        key: "gene",
        render: record => <div>Placeholder</div>
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "t"
      },
      {
        title: "Impact",
        key: "impact",
        dataIndex: "impact"
      }
    ];

    const contentList = {
      tab1: (
        <Row>
          <Col span={8}>
            <Statistic
              title="Name"
              value={`${this.props.userData.user.firstName} ${this.props.userData.user.lastName}`}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Date of Birth"
              value={this.props.userData.user.dateOfBirth.split("T")[0]}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="IDs"
              value={`${this.props.userData.user.userId}; ${this.props.geneData.coreQuery.samples[0]}`}
            />
          </Col>
        </Row>
      ),
      tab2: (
        <Row>
          <Col span={8}>
            <Statistic title="Variants" value={this.props.geneData.total} />
          </Col>
          <Col span={8}>
            <Statistic title="Filtered to" value={this.state.filtered.length} />
          </Col>
          <Col span={8}>
            <Statistic
              title="Reduction"
              value={`${(1 -
                (
                  this.state.filtered.length / this.props.geneData.total
                ).toFixed(2)) *
                100}%`}
            />
          </Col>
        </Row>
      ),
      tab3: (
        <Table dataSource={this.state.filtered} columns={columns} rowKey="s" />
      )
    };

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
              return contentList[this.state.key];
            })()}
          </Card>
        </div>
      </Content>
    );
  }
}
