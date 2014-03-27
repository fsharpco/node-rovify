/**
 * Created by julianfg on 3/24/14.
 */
var config = require('easy-config');
var crypto = require('crypto');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');
var reqOptions = {
  headers: {
    'Accept-Encoding': 'gzip,deflate'
  }
};

var Rovi = function(resource,criteria,queryString) {
//  if (!config || !config.hasOwnProperty('key') && !config.hasOwnProperty('secret')) {
//    throw new Error('Cannot create rovi object without valid key and shared secret');
//  }
  this.resource = resource;
  this.criteria = criteria;
  this.queryString = queryString;
  this.key = config.api_key;
  this.secret = config.shared_secret;
  this.base_uri = config.base_uri;
  this.sig = this.createSig(this.key,this.secret);
  this.request_url = this.buildUrl();
  return this;
}

Rovi.prototype.createSig = function(key,secret) {
//  var now = new Date().toGMTString();
  var utc = Date.parse(new Date().toGMTString()) / 1000;
  var text = key+secret+utc;
  var md5Hash = crypto.createHash('md5').update(text).digest("hex");
  return md5Hash;
}


Rovi.prototype.buildUrl = function() {
   var url = this.base_uri +
   '/' + this.resource +
   '?' + 'apikey=' + this.key +
   '&' + 'sig=' + this.sig +
   '&' + this.criteria + '=' + this.queryString;
  return url;
}


Rovi.prototype.request = function(options,cb) {
  if (typeof(options) === 'function') {
    cb = options;
    options = {};
  };
  hyperquest.get(this.request_url, reqOptions, function (err, apiRes) {
    if (err) {
      cb(err);
    } else {
      statusCode = apiRes.statusCode;
    }
  }).pipe(concat(function (data) {
    if (statusCode !== 200) {
      cb(new Error(data));
    } else {
      cb(null, data);
    }
  }));
}

module.exports = Rovi;