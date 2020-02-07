import React, { Component } from "react";

import { Fragment } from "react";
import axios from "axios";

export default class ClinicianQueryValidation extends Component {
  state = {
    geneData: [],
    isLoading: true
  };

  componentDidMount() {
    const url = "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    const body = JSON.stringify({
      from: 0,
      size: 5,
      query: {
        dis_max: {
          queries: [
            {
              match: {
                id: {
                  query: this.props.formQueryValues.genes || ""
                }
              }
            },
            {
              match_phrase_prefix: {
                symbol: {
                  query: this.props.formQueryValues.genes || "",
                  max_expansions: 20,
                  boost: 2
                }
              }
            },
            {
              match: {
                symbol: {
                  query: this.props.formQueryValues.genes || "",
                  fuzziness: 1,
                  boost: 2
                }
              }
            },
            {
              match: {
                description: {
                  query: this.props.formQueryValues.genes || "",
                  fuzziness: 1
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
      console.log(searchResult);
      const chromosome = searchResult.data.hits.hits[0]
        ? searchResult.data.hits.hits[0]._source.chromosome
        : this.props.formQueryValues.region.split(":")[0];

      const positionStart = searchResult.data.hits.hits[0]
        ? searchResult.data.hits.hits[0]._source.start
        : this.props.formQueryValues.region.split(":")[1].split("-")[0];

      const positionEnd = searchResult.data.hits.hits[0]
        ? searchResult.data.hits.hits[0]._source.end
        : this.props.formQueryValues.region.split(":")[1].split("-")[1];

      const url = "https://vsal.garvan.org.au/vsal/core/find";
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2djL2Nhbm55VG9rZW4iOiJleUpoYkdjaU9pSklVekkxTmlJc0luUjVjQ0k2SWtwWFZDSjkuZXlKbGJXRnBiQ0k2SW1Gc1pYaEFjbWwyYVM1cGJ5SXNJbWxrSWpvaVoyOXZaMnhsTFc5aGRYUm9Nbnd4TVRZeU5qVXpOamM1TnpFME16STVPRE13TURRaUxDSnVZVzFsSWpvaVlXeGxlQ0lzSW1saGRDSTZNVFU0TURrMk5EYzJOQ3dpWlhod0lqb3hOVGd4TURBd056WTBmUS5LREZ1S2t5RGRpYU1RaU9mYWR4Uml0ejdld2cyUTVxM1BqR1JpeHBXbEtnIiwiaHR0cHM6Ly9zZ2MuZ2FydmFuLm9yZy5hdS9jbGFpbXMvcGVybWlzc2lvbnMiOltdLCJlbWFpbCI6ImFsZXhAcml2aS5pbyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJpc3MiOiJodHRwczovL3NnYy5hdS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMTYyNjUzNjc5NzE0MzI5ODMwMDQiLCJhdWQiOiJlUzJIQTZhU1lueENYRnZvOWJ6SHBWMURJNkgxeXcwbCIsImlhdCI6MTU4MDk2NDc2NSwiZXhwIjoxNTgwOTcxOTY1LCJhdF9oYXNoIjoiMXlBemhkWmFVMTVzcHRSZGJKeTFJQSIsIm5vbmNlIjoiSX5vdUs0cEdSQlNWeXQxZHcwazlfWjAxRnRCdHhmNlQifQ.FLdqceJ86QRY4-SaPm711Wwo6PjjB3ZvTFpJkZJXewM"
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
        console.log(variantResult);
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
