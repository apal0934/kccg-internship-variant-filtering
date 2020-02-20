var express = require("express");
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function consent2samples(consentOrg, consentPurpose, consentHpos) {
  var url = "http://localhost:8000";
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
      consentOrg: consentOrg,
      consentPurpose: consentPurpose,
      consentHpos: consentHpos
    }
  });
  var request = new XMLHttpRequest();
  request.open("POST", url, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(body);

  if (request.status === 200) {
    url = "http://localhost:7000";
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
        userIds: JSON.parse(request.responseText).data.users.map(user => {
          return user.userId;
        })
      }
    });
    request = new XMLHttpRequest();
    request.open("POST", url, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(body);

    if (request.status === 200) {
      return JSON.parse(request.responseText).data.usersToGenomes.map(user => {
        return user.genomeId;
      });
    }
  }
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

module.exports = router;
module.exports = consent2samples;
