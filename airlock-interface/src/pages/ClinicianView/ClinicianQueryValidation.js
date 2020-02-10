import React, { Component } from "react";

import { Fragment } from "react";
import axios from "axios";

export default class ClinicianQueryValidation extends Component {
  state = {
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    /* Use KCCG's elasticsearch to translate gene names (i.e. TTN) to position in genome */
    const url = "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    const lines = this.props.formQueryValues.genes
      ? this.props.formQueryValues.genes.split(/\r\n|\r|\n/)
      : [];
    const numGenes = lines.length;
    const body = JSON.stringify({
      from: 0,
      size: numGenes,
      query: {
        dis_max: {
          queries: [
            {
              match: {
                symbol: {
                  query: this.props.formQueryValues.genes || "",
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
    });

    axios.post(url, body, config).then(searchResult => {
      /* If genes found, sort into CSVs of Chromosome, Position Start/End
         Otherwise, assume region was given.
         Region in format chromosome:start-end */

      var chromosome;
      var positionStart;
      var positionEnd;

      if (searchResult.data.hits.hits[0]) {
        chromosome = searchResult.data.hits.hits
          .map(genes => {
            return genes._source.chromosome;
          })
          .join(",");

        positionStart = searchResult.data.hits.hits
          .map(genes => {
            return genes._source.start;
          })
          .join(",");

        positionEnd = searchResult.data.hits.hits
          .map(genes => {
            return genes._source.end;
          })
          .join(",");
      } else {
        const regionLines = this.props.formQueryValues.region.split(
          /\r\n|\r|\n/
        );

        chromosome = regionLines
          .map(region => {
            return region.split(":")[0];
          })
          .join(",");

        positionStart = regionLines
          .map(region => {
            return region.split(":")[1].split("-")[0];
          })
          .join(",");

        positionEnd = regionLines
          .map(region => {
            return region.split(":")[1].split("-")[1];
          })
          .join(",");
      }

      const url = "https://vsal.garvan.org.au/vsal/core/find";
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer fakeTokenForDemo"
        }
      };

      const body = JSON.stringify({
        chromosome: chromosome,
        positionStart: positionStart,
        positionEnd: positionEnd,
        limit: "10000",
        skip: 0,
        samples: this.props.mappingData.userToGenome.genomeId,
        dataset: "demo"
      });

      axios.post(url, body, config).then(variantResult => {
        this.setState({
          geneData: variantResult.data
        });
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state !== prevState && this.state.isLoading) {
      if (this.state.geneData.coreQuery) {
        this.setState(
          {
            isLoading: false
          },
          () => {
            this.props.parentCallback(
              this.state.isLoading,
              this.state.geneData
            );
          }
        );
      }
    }
  }

  render() {
    return <Fragment />;
  }
}
