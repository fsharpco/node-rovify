/**
 * Created by julianfg on 3/24/14.
 */
var config = require('easy-config');
var crypto = require('crypto');
var hyperquest = require('hyperquest');
var timeout = require('hyperquest-timeout');
var concat = require('concat-stream');
var reqOptions = {
  headers: {
    'Accept-Encoding': 'gzip,deflate,sdch'
  }
};

var Rovi = function(api,path,query,key,secret) {
//  if (!config || !config.hasOwnProperty('key') && !config.hasOwnProperty('secret')) {
//    throw new Error('Cannot create rovi object without valid key and shared secret');
//  }
  if ( api === 'search' ) {
    this.api = "search/v2.1";
  } else if ( api === 'data') {
    this.api = "data/v1.1";
  } else {
    this.api = "snrpreview/v2.1"
  }

  this.path = path;
//  this.criteria = criteria;
  this.query = query;
	// use default config/config.json key/secret if nothing entered
	if (key) {
		this.key = key;
		this.secret = secret;
	} else {
		this.key = config.api_key;
		this.secret = config.shared_secret;
	}

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
      '/' + this.api +
      '/' + this.path +
      this.query +
      '&' + 'apikey=' + this.key +
      '&' + 'sig=' + this.sig +
      '&format=json';
//      '&include=all';
  return url;
}

Rovi.prototype.request = function(cb) {
	if (typeof(cb) !== 'function') {
		cb(new Error('ERROR: not valid callback'));
		return;
	}
  console.log('URL submitted: ' + this.request_url);
	var req = hyperquest(this.request_url, function (err, hqResponse) {
		if (err) {
			return cb(err);
		} else if (hqResponse.statusCode !== 200) {
			return cb(new Error('Rovi API returned RESPONSE CODE: ' + hqResponse.statusCode));
		} else {
			console.log('RESPONSE CODE: ' + hqResponse.statusCode);
		}
	});
	req.on('error', function (res) {
		cb(new Error('ERROR: ' + res));
	});
	req.pipe(concat(function (data) {
		cb(null, data.toString()); // convert to string to return to cb
	}));
};

//Rovi.prototype.request = function(options,cb) {
//  if (typeof(options) === 'function') {
//    cb = options;
//    options = {};
//  };
////  hyperquest.get(this.request_url, reqOptions, function (err, apiRes) {
//  hyperquest.get(this.request_url,function (err, apiRes) {
//    if (err) {
//      cb(err);
//    } else {
//      statusCode = apiRes.statusCode;
////      console.log(statusCode);
//    }
//  }).pipe(concat(function (data) {
//    if (statusCode !== 200) {
//      cb(new Error('{"error" : ' + data + '}'));
//    } else {
////			console.log('******** DATA **********');
////			console.log(data);
////			console.log('******** DATA **********');
//			cb(null, data.toString());
//    }
//  }));
////	timeout(req,60000);
//}


//
//	Rovi.prototype.request = function(options,cb) {
//  if (typeof(options) === 'function') {
//    cb = options;
//    options = {};
//  };
////  hyperquest.get(this.request_url, reqOptions, function (err, apiRes) {
//  var hyper = hyperquest(this.request_url,function (err, apiRes) {
//    if (err) {
//      cb(err);
//    } else {
//      statusCode = apiRes.statusCode;
////      console.log(statusCode);
//    }
//  }).pipe(concat(function (data) {
//    if (statusCode !== 200) {
//			console.log("ERROR:")
//      cb(new Error('{"error" : ' + data + '}'));
//    } else {
////			console.log('******** DATA **********');
////			console.log(data);
////			console.log('******** DATA **********');
//			cb(null, data.toString());
//    }
//  }));
//
//	timeout(hyper,30000);
//}

module.exports = Rovi;