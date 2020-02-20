var express = require("express");
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function gene2variant(samples, geneQuery) {
  const url = "https://dr-sgc.kccg.garvan.org.au/_elasticsearch/_search";

  /* Split gene input into array to count how many genes */
  const lines = geneQuery.genes ? geneQuery.genes.split(/\r\n|\r|\n/) : [];
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
                query: geneQuery.genes || "",
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
  });

  var request = new XMLHttpRequest();
  request.open("POST", url, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(body);

  if (request.status === 200) {
    /* If genes found, sort into CSVs of Chromosome, Position Start/End
       Otherwise, assume region was given.
       Region in format chromosome:start-end */
    var searchResult = JSON.parse(request.responseText);
    var chromosome;
    var positionStart;
    var positionEnd;

    if (searchResult.hits.hits[0]) {
      chromosome = searchResult.hits.hits
        .map(genes => {
          return genes._source.chromosome;
        })
        .join(",");

      positionStart = searchResult.hits.hits
        .map(genes => {
          return genes._source.start;
        })
        .join(",");

      positionEnd = searchResult.hits.hits
        .map(genes => {
          return genes._source.end;
        })
        .join(",");
    } else {
      const regionLines = geneQuery.region.split(/\r\n|\r|\n/);

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

    /* KCCG clinical filtering, retrieve variants on genes for samples */
    const url = "https://vsal.garvan.org.au/vsal/core/find";

    var find = new XMLHttpRequest();
    find.open("POST", url, false);
    find.setRequestHeader("Content-Type", "application/json");
    find.setRequestHeader("Authorization", "Bearer fakeTokenForDemo");

    const body = JSON.stringify({
      chromosome: chromosome,
      positionStart: positionStart,
      positionEnd: positionEnd,
      limit: "10000",
      skip: 0,
      samples: samples.join(","),
      dataset: "demo"
    });

    find.send(body);

    if (find.status === 200) {
      return JSON.parse(find.responseText);
    }
  }
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
  res.send(gene2variant(res.body.samples, res.body.geneQuery));
});

module.exports = router;
module.exports = gene2variant;
