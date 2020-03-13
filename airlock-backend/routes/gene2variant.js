var express = require("express");
var router = express.Router();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var io = require("../socketApi").io;
var axios = require("axios");

function symbol2position(geneQuery, callback) {}

function gene2variant(samples, geneQuery, callback) {
  /* Send status update - Requesting Coordinates */
  io.sockets.to("test").emit("progress", 0);

  /* Setup request */
  var url = "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer fakeTokenForDemo"
    }
  };

  /* arrays to hold data, i-th element of any array should correspond to i-th element in any other */
  var chromosomes = [];
  var positionStarts = [];
  var positionEnds = [];

  /* If region provided, no need to query */
  if (geneQuery.regions) {
    const lines = geneQuery.regions.split(",");
    lines.forEach(region => {
      chromosomes.push(region.split(":")[0]);
      positionStarts.push(region.split(":")[1].split("-")[0]);
      positionEnds.push(region.split(":")[1].split("-")[1]);
    });
    /* KCCG clinical filtering, retrieve variants on genes for samples */
    url = "https://vsal.garvan.org.au/vsal/core/find";

    var body = JSON.stringify({
      chromosome: chromosomes.join(","),
      positionStart: positionStarts.join(","),
      positionEnd: positionEnds.join(","),
      limit: "10000",
      skip: 0,
      samples: samples.join(","),
      dataset: "demo"
    });

    axios
      .post(url, body, config)
      .then(res => {
        callback(res.data);
      })
      .catch(error => {
        console.log(error);
        throw error;
      });
  }

  var promises = [];
  /* If gene symbols provided, request each symbol and store promise */
  if (geneQuery.genes) {
    const lines = geneQuery.genes.split(",");

    lines.forEach(gene => {
      const body = {
        from: 0,
        size: 1,
        query: {
          dis_max: {
            queries: [
              {
                match: {
                  symbol: {
                    query: gene,
                    fuzziness: 0,
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
      promises.push(axios.post(url, body, config));
    });
  }

  /* Evaluate promises */
  axios.all(promises).then(results => {
    results.forEach(result => {
      chromosomes.push(result.data.hits.hits[0]._source.chromosome);
      positionStarts.push(result.data.hits.hits[0]._source.start);
      positionEnds.push(result.data.hits.hits[0]._source.end);
    });

    /* Send status update - Requesting Variants */
    io.sockets.to("test").emit("progress", 1);

    /* KCCG clinical filtering, retrieve variants on genes for samples */
    url = "https://vsal.garvan.org.au/vsal/core/find";

    var body = JSON.stringify({
      chromosome: chromosomes.join(","),
      positionStart: positionStarts.join(","),
      positionEnd: positionEnds.join(","),
      limit: "10000",
      skip: 0,
      samples: samples.join(","),
      dataset: "demo"
    });

    axios
      .post(url, body, config)
      .then(res => {
        callback(res.data);
      })
      .catch(error => {
        console.log(error);
      });
  });
}

/*
  Return all variants in samples in genes

  :param array samples: list of sample IDs to query
  :param obj geneQuery: 
    :attr str regions: region(s) to query in format chr:start-end
    :attr str genes: gene(s) to query
    :attr str variants: do not use
*/
router.post("/", function(req, res) {
  gene2variant(req.body.samples, req.body.geneQuery, response => {
    res.send(response);
  });
});

module.exports = {
  router: router,
  gene2variant: gene2variant
};
