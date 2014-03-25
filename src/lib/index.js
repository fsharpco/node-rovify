/**
 * Created by julianfg on 3/24/14.
 */
var config = require('easy-config');
var crypto = require('crypto');
var hyperquest = require('hyperquest');
var reqOptions = {
  headers: {
    'Accept-Encoding': 'gzip,deflate'
  }
};

var Rovi = function(resource,method,param,criteria) {
//  if (!config || !config.hasOwnProperty('key') && !config.hasOwnProperty('secret')) {
//    throw new Error('Cannot create rovi object without valid key and shared secret');
//  }
  this.resource = resource;
  this.method = method;
  this.param = param;
  this.criteria = criteria;
  this.key = config.api_key;
  this.secret = config.shared_secret;
  this.sig = this.createSig(this.key,this.secret);
  this.base_uri = config.base_uri;
  return this;
}

Rovi.prototype.createSig = function(key,secret) {
//  var now = new Date().toGMTString();
  var utc = Date.parse(new Date().toGMTString()) / 1000;
  var text = key+secret+utc;
  md5Hash = crypto.createHash('md5').update(text).digest("hex");
  return md5Hash;
}


Rovi.prototype.buildUrl = function() {
  return this.base_uri +
   '/' + this.resource +
   '/' + this.method +
   '?' + 'apikey=' + this.key +
   '&' + 'sig=' + this.sig +
   '&' + this.param + '=' + this.criteria;
}

Rovi.prototype.request = function() {
  console.log(this.buildUrl());
  hyperquest.get(this.buildUrl(), reqOptions, function(err, apiRes) {
    console.log(apiRes);
    return apiRes;
  });
//    if (err) {
//      cb(err);
//    } else {
//      statusCode = apiRes.statusCode;
//    }
//  }).pipe(concat(function(data) {
//    if (statusCode !== 200) {
//      cb(new Error(data));
//    } else {
//      cb(null, data);
//    }
//  }
}




//Rovi.prototype.get = function() {
//  return this.
//}

module.exports = Rovi