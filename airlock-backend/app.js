var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var socketIo = require("socket.io");
require("https").globalAgent.options.ca = require("ssl-root-cas/latest").create();

var indexRouter = require("./routes/index");
var g2v = require("./routes/gene2variant.js").router;
var p2s = require("./routes/patient2samples");
var clincian = require("./routes/clinician.js");
var researcher = require("./routes/researcher");
var app = express();

var corsOptions = {
  origin: "*"
};

var io = socketIo();
app.io = io;

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors(corsOptions));
app.use("/", indexRouter);
app.use("/g2v", g2v);
app.use("/clinician", clincian);
app.use("/researcher", researcher);
app.use("/p2s", p2s.router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
