var express = require("express");
var router = express.Router();
var fs = require("fs");
const exec = require("child_process").exec;
var io = require("../socketApi").io;

function sort(a, b) {
  let comp = 0;
  if (a.value < b.value) {
    comp = 1;
  } else {
    comp = -1;
  }

  return comp;
}

function annotate(geneData, filterData, aggregate, callback) {
  var variants = geneData.v;
  var clinvar = {};
  var type = {};
  var consequence = {};

  if (filterData.filter === "yes") {
    variants = variants.filter(gene => {
      return gene.af <= filterData.alleleFreq;
    });
  }

  /* Format the variants from Vectis into VEP */
  var data = "";
  variants.forEach(variant => {
    data += `${variant.c} `;
    if (variant.t === "INS") {
      data += `${variant.s + 1} ${variant.s} `;
      data += `-/${variant.a.slice(1)} `;
    } else if (variant.t === "DEL") {
      data += `${variant.s + 1} ${variant.s + (variant.r.length - 1)} `;
      data += `${variant.r.slice(1)}/- `;
    } else {
      data += `${variant.s} ${variant.s} ${variant.r}/${variant.a} `;
    }
    data += `+\n`;
  });

  /* Write to a file VEP can read. This kind of path hard coding is bad but hey it's just a prototype */
  fs.writeFile("/Users/alexpalmer/ensembl-vep/variants.txt", data, err => {
    if (err) throw err;
    /* Setup initial command */
    /* This will not work on other machines, sorry :( */

    var command =
      'source ~/.bash_profile && ./vep --cache -i variants.txt --tab --fields "Location,Allele,Consequence,Existing_variation,REF_ALLELE,IMPACT,VARIANT_CLASS,SYMBOL,AF,CLIN_SIG,CADD_PHRED" --show_ref_allele --variant_class --port 3337 -af --check_existing --plugin CADD,../whole_genome_SNVs.tsv.gz,../InDels.tsv.gz --symbol --pick -o stdout --no_stats --offline | ./filter_vep -o stdout --filter "SYMBOL exists" ';
    /* Add AF, CADD and ClinVar filters */
    if (filterData.filter === "yes") {
      command += `--filter "(AF < ${filterData.alleleFreq} or not AF) and (CADD_PHRED >= ${filterData.cadd} ${filterData.operator} CLIN_SIG match ${filterData.clinvar} ${filterData.operator} `;

      switch (filterData.impact) {
        case "all":
          command += `(IMPACT != MODIFIER))"`;
          break;
        case "high":
          command += `(IMPACT is HIGH))"`;
          break;
        case "highmed":
          command += `(IMPACT in MODERATE,HIGH))"`;
          break;
        default:
          command += ')"';
      }

      switch (filterData.variantType) {
        case "snp":
          command += ' --filter "VARIANT_CLASS is SNV"';
          break;
        case "indel":
          command += ` --filter "VARIANT_CLASS in insertion,deletion,indel"`;
          break;
        default:
          break;
      }
    }
    io.sockets.to("test").emit("progress", 2);

    exec(
      command,
      {
        cwd: "/Users/alexpalmer/ensembl-vep/",
        encoding: "utf-8"
      },
      (err, output) => {
        if (err) throw err;
        io.sockets.to("test").emit("progress", 3);
        /* Split output into lines */
        var lines = output.split("\n");
        /* Reduce to header + data */
        lines = lines.slice(33, lines.length - 1);
        /* Isolate header */
        const headers = lines[0].split("\t");
        const annotatedVariants = [];

        /* On all lines that are not the header... */
        lines.slice(1, lines.length).forEach(line => {
          /* Split into each entry */
          var datapoints = line.split("\t");
          var annotatedVariant = {};

          /* For each entry, store it in the object with the key from the header */
          datapoints.forEach((datapoint, j) => {
            annotatedVariant[headers[j]] = datapoint;
          });

          /* If research aggregation, count all occurances of each */
          if (aggregate) {
            clinvar[annotatedVariant.CLIN_SIG] =
              (clinvar[annotatedVariant.CLIN_SIG] || 0) + 1;
            type[annotatedVariant.VARIANT_CLASS] =
              (type[annotatedVariant.VARIANT_CLASS] || 0) + 1;
            consequence[annotatedVariant.Consequence] =
              (consequence[annotatedVariant.Consequence] || 0) + 1;
          }

          annotatedVariants.push(annotatedVariant);
        });

        /* If research, format the data into how the table can read it */
        if (aggregate) {
          var clinvarData = [];
          var typeData = [];
          var consequenceData = [];

          Object.keys(clinvar).forEach(key => {
            if (key !== "null" && key !== "-")
              clinvarData.push({ name: key, value: clinvar[key] });
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

          callback({
            clinvar: clinvarData,
            type: typeData,
            consequence: consequenceData
          });
        } else {
          callback(annotatedVariants);
        }
      }
    );
  });
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
