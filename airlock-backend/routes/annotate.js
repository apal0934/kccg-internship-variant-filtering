var express = require("express");
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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

function sort(a, b) {
  let comp = 0;
  if (a.value < b.value) {
    comp = 1;
  } else {
    comp = -1;
  }

  return comp;
}

function annotate(geneData, aggregate) {
  var variants = geneData.v;
  var clinvar = {};
  var type = {};
  var consequence = {};
  /* 
    For each gene queried (number of chromosomes in query):
      retrieve all variants + annotations in that gene, and,
      add those annotations to the corresponding variants in geneData 
  */
  geneData.coreQuery.chromosome.forEach((chromosome, i) => {
    let url = `https://vsal.garvan.org.au/ssvs/demo/query?chr=${chromosome.substring(
      3
    )}&start=${geneData.coreQuery.positionStart[i]}&end=${
      geneData.coreQuery.positionEnd[i]
    }&limit=10000&sortBy=start&descend=false&skip=0&count=true&annot=true&dataset=demo`;

    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send(null);

    if (request.status === 200) {
      var res = JSON.parse(request.responseText);

      res.variants.forEach(globalVariant => {
        variants.forEach(sampleVariant => {
          if (
            globalVariant.chr === sampleVariant.c &&
            globalVariant.start === sampleVariant.s &&
            globalVariant.alt === sampleVariant.a &&
            globalVariant.ref === sampleVariant.r
          ) {
            sampleVariant["impact"] = impactEnum[globalVariant.consequences];
            sampleVariant["clinvar"] = globalVariant.clinvar;
            if (aggregate) {
              clinvar[globalVariant.clinvar] =
                (clinvar[globalVariant.clinvar] || 0) + 1;
              type[globalVariant.type] = (type[globalVariant.type] || 0) + 1;
              consequence[globalVariant.consequences] =
                (consequence[globalVariant.consequences] || 0) + 1;
            }
          }
        });
      });
    }
  });

  if (aggregate) {
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

    clinvarData.sort(sort);
    typeData.sort(sort);
    consequenceData.sort(sort);

    return {
      clinvar: clinvarData,
      type: typeData,
      consequence: consequenceData
    };
  }

  return variants;
}

/*
  Annotate variants with additional information

  :param obj geneData: the object returned from VSAL
*/
router.post("/", function(req, res) {
  res.send(annotate(req.body.geneData));
});

module.exports = router;
module.exports = annotate;
