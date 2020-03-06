var express = require("express");
var router = express.Router();
var axios = require("axios");

function consent2samples(consentData, callback) {
  var url = "http://" + process.env.DYNAMIC_CONSENT_IP;
  var body = JSON.stringify({
    query: `query UserQuery(
        $consentOrg: Int
        $consentPurpose: [String]
        $consentHpos: [String]
      ) {
        users(
          consentOrg: $consentOrg
          consentPurpose: $consentPurpose
          consentHpos: $consentHpos
        ) {
          userId
          firstName
          lastName
          email
        }
      }`,
    variables: {
      consentOrg: consentData.consentOrg,
      consentPurpose: consentData.consentPurpose,
      consentHpos: consentData.consentHpos
    }
  });
  const config = {
    headers: {
      "Content-Type": "application/json"
    }
  };
  axios
    .post(url, body, config)
    .then(userRes => {
      url = "http://" + process.env.GENE_TRUSTEE_IP;
      body = JSON.stringify({
        query: `
          query GenomeQuery($userIds: [Int]) {
            usersToGenomes(userIds: $userIds) {
              userId
              genomeId
            }
          }
        `,
        variables: {
          userIds: userRes.data.data.users.map(user => {
            return user.userId;
          })
        }
      });
      axios
        .post(url, body, config)
        .then(sampleRes => {
          callback(
            sampleRes.data.data.usersToGenomes.map(user => {
              return user.genomeId;
            })
          );
        })
        .catch(err => {
          throw err;
        });
    })
    .catch(err => {
      throw err;
    });
}

/* GET home page. */
router.get("/", function(req, res, next) {
  res.send(
    consent2samples(
      req.body.consentOrg,
      req.body.consentPurpose,
      req.body.consentHpos
    )
  );
});

module.exports = consent2samples;
