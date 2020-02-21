var express = require("express");
var router = express.Router();
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function patient2samples(firstName, lastName, dateOfBirth) {
  var url = "http://localhost:8000";
  var body = JSON.stringify({
    query: `query UserQuery(
            $firstName: String
            $lastName: String
            $dateOfBirth: String
          ) {
            user(
              firstName: $firstName
              lastName: $lastName
              dateOfBirth: $dateOfBirth
            ) {
              userId
              firstName
              lastName
              email
              dateOfBirth
            }
          }
        `,
    variables: {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth
    }
  });
  var request = new XMLHttpRequest();
  request.open("POST", url, false);
  request.setRequestHeader("Content-Type", "application/json");
  request.send(body);

  switch (request.status) {
    case 200:
      var data = {};
      data["user"] = JSON.parse(request.responseText).data.user;
      console.log(JSON.parse(request.responseText));
      url = "http://localhost:7000";
      body = JSON.stringify({
        query: `
              query mappingQuery($userId: Int) {
                userToGenome(userId: $userId) {
                  genomeId
                }
              }
            `,
        variables: {
          userId: data["user"].userId
        }
      });
      request = new XMLHttpRequest();
      request.open("POST", url, false);
      request.setRequestHeader("Content-Type", "application/json");
      request.send(body);

      switch (request.status) {
        case 200:
          data["mapping"] = JSON.parse(
            request.responseText
          ).data.userToGenome.genomeId;
          return data;
        case 400:
          return { error: JSON.parse(request.responseText).errors[0].message };
      }
    case 400:
      return { error: JSON.parse(request.responseText).errors[0].message };
  }
}

/* Returns patient sample ID from GeneTrustee

   :param str firstName
   :param str lastName
   :param int dateOfBirth: the getTime of a date object
*/
router.post("/", function(req, res, next) {
  console.log(req.body);
  res.send(
    patient2samples(req.body.firstName, req.body.lastName, req.body.dateOfBirth)
  );
});

module.exports = {
  router,
  patient2samples
};
