var express = require("express");
var router = express.Router();

var consent2samples = require("./consent2samples");
var gene2variant = require("./gene2variant");
var annotate = require("./annotate");

function aggregate(consentData, gene2variantData) {
  const { consentOrg, consentPurpose, consentHpos } = consentData;
  const { geneQuery } = gene2variantData;
  var samples = consent2samples(consentOrg, consentPurpose, consentHpos);
  var variants = gene2variant(samples, geneQuery);
  var annotatedVariants = annotate(variants, true);

  annotatedVariants["stats"] = {
    genes: variants.coreQuery.chromosome.length,
    samples: samples.length,
    variants: variants.total
  };

  return annotatedVariants;
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
*/
router.post("/", function(req, res) {
  res.send(aggregate(req.body.consentData, req.body.gene2variantData));
});

module.exports = router;
