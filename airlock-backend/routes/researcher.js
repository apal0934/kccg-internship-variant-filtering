var express = require("express");
var router = express.Router();

var consent2samples = require("./consent2samples");
var gene2variant = require("./gene2variant");
var annotate = require("./annotate");

function aggregate(consentData, gene2variantData, filterData, callback) {
  const { geneQuery } = gene2variantData;

  consent2samples(consentData, samples => {
    gene2variant(samples, geneQuery, variants => {
      annotate(variants, filterData, true, annotatedVariants => {
        annotatedVariants["stats"] = {
          genes: variants.coreQuery.chromosome.length,
          samples: samples.length,
          variants: variants.total
        };
        callback(annotatedVariants);
      });
    });
  });
}

/* 
  Return aggregated statistics for researchers
  :param obj consentData:
    :attr int consentOrg: ID of the type of organisation
    :attr array consentPurpose: list of DUO codes
    :attr array consentHpos: list of HPO codes
  :param obj gene2variantData:
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
  aggregate(
    req.body.consentData,
    req.body.gene2variantData,
    req.body.filterData,
    data => {
      res.send(data);
    }
  );
});

module.exports = router;
