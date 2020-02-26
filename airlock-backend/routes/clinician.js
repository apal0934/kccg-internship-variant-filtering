var express = require("express");
var router = express.Router();

var gene2variant = require("./gene2variant");
var annotate = require("./annotate");

function aggregate(gene2variantData, filterData, callback) {
  const { samples, geneQuery } = gene2variantData;

  gene2variant(samples, geneQuery, variants => {
    annotate(variants, filterData, false, annotatedVariants => {
      annotatedVariants.push({
        initial: variants.total,
        filtered: annotatedVariants.length,
        samples: variants.coreQuery.samples
      });
      callback(annotatedVariants);
    });
  });
}

/* 
  Run full clinical filtering suite

  :param obj gene2variantData:
    :attr array samples: list of sample IDs to query
    :attr obj geneQuery:
      :attr str regions: region(s) to query in format chr:start-end
      :attr str genes: gene(s) to query
      :attr str variants: do not use
  :param obj filterData:
    :attr int alleleFreq: upper bound allele frequency in percent
    :attr str variantType:
      :option both: SNP & INDELs
      :option snp: only SNPs
      :option indel: only INDELs
    :attr str impact:
      :option all: low, medium & high impacts
      :option high: only high impacts
      :option highmed: medium and high impacts
    :attr str clinvar: string to match to clinvar term
*/
router.post("/", function(req, res) {
  aggregate(req.body.gene2variantData, req.body.filterData, response => {
    res.send(response);
  });
});

module.exports = router;
