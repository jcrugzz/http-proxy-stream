'use strict';

var http = require('http');
var url = require('url');
var bl = require('bl');
var assume = require('assume');
var HttpProxyStream = require('..');

describe('http-proxy-stream', function () {
  this.timeout(5E3);
  it('should proxy to the server', function (done) {
    var ports = {
      target: 4000,
      server: 3000
    };

    var target = http.createServer((req, res) => {
      res.end('Success');
    });

    var server = http.createServer((req, res) => {
      req
        .pipe(new HttpProxyStream(url.parse(`http://localhost:${ports.target}`)))
        .pipe(res);
    });

    var next = assume.wait(2, makeRequest);
    server.listen(ports.server, next);
    target.listen(ports.target, next);

    function makeRequest() {
      var opts = url.parse(`http://localhost:${ports.server}`);
      opts.method = 'GET';

      var req = http.request(opts);
      req.on('error', done);
      req.on('response', (res) => {
        res.pipe(bl((err, buf) => {
          if (err) return done(err);

          assume(buf.toString()).equals('Success');
        }))
      });
      req.end();
    }

  });

});
