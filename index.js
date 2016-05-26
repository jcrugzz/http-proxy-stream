'use strict';

var duplexify = require('duplexify');
var util = require('util');
var url = require('url');
var http = require('http-https');
var debug = require('diagnostics')('http-proxy-stream');

module.exports = HttpProxyStream;

/**
 * @constructor
 *
 * @param {Object|string} options - Options for the http-proxy-stream or the arget path
 *  @param {Number} proxyTimeout - Maybe?
 *
 */
function HttpProxyStream (options) {

  this.stream = duplexify();
  this.options = options;

  this.stream._proxy = this;

  //
  // See if we can get the request stream on the pipe event
  //
  this.stream.once('pipe', this._onPipe.bind(this));

  return this.stream;
}

HttpProxyStream.prototype._onPipe = function onPipe(req) {
  debug(`${req.method} - ${req.url}`);
  //
  // Remark: We are accepting the options from httpProxy.setupOutgoing in
  // common.js which returns us all the parameters we need in order to make the
  // request. To make this more generic, we may need to inspect the request we
  // are getting
  this.request = http.request(
    Object.assign({ method: req.method }, this.options)
  );

  this.stream.setWritable(this.request);
  this.request.on('response', (res) => {
    this.stream.setReadable(res);
  });
};
