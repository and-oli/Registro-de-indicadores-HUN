const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const dbCon = require("./config/db")();
const users= require('./routes/users')(dbCon);
const indicators= require('./routes/indicators')(dbCon);
const units= require('./routes/units')(dbCon);
const accesses= require('./routes/accesses')(dbCon);
const requests= require('./routes/requests')(dbCon);
const records= require('./routes/records')(dbCon);

const app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../frontend/build')));

app.use('/users',  users);
app.use('/indicators',  indicators);
app.use('/units',  units);
app.use('/accesses',  accesses);
app.use('/requests',  requests);
app.use('/records',  records);


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
