var express = require("express");
var router = express.Router();

function filterVariants(variants, alleleFreq, variantType, impact, clinvar) {
  var filtered = variants
    .filter(gene => {
      return gene.af <= alleleFreq / 100;
    })
    .filter(gene => {
      var a = false;
      switch (variantType) {
        case "both":
          a = true;
          break;
        case "snp":
          a = gene.t === "SNV";
          break;
        case "indel":
          a = gene.t === "INS" || gene.t === "DEL";
          break;
        default:
          a = true;
          break;
      }

      var b = false;
      switch (impact) {
        case "all":
          b = gene.impact !== "MODIFIER";
          break;
        case "high":
          b = gene.impact === "HIGH";
          break;
        case "highmed":
          b = gene.impact === "HIGH" || gene.impact === "MODERATE";
          break;
        default:
          b = false;
          break;
      }

      var c = gene.clinvar ? gene.clinvar.includes(clinvar) : false;
      // var d = gene.cadd >= 24

      return a && (b || c);
      // return a && (b || c || d)
    });

  return filtered;
}

/*
  Filter given variants with specified params

  :param obj geneData: the object returned from VSAL
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
  var filtered = filter(
    req.body.geneData,
    req.body.alleleFreq,
    req.body.variantType,
    req.body.impact,
    req.body.clinvar
  );

  res.send(filtered);
});

module.exports = router;
module.exports = filterVariants;
