var Teaform = require("..");
var boundaryFromHeader = require('./helpers').boundaryFromHeader;

describe("empty form", function () {
  it("should be the ending boundary alone (empty object)", function (done) {
    var form = Teaform({});
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      var boundary = boundaryFromHeader(form.headers['Content-Type']);
      expect(formDataBody).toBe('--' + boundary + '--');
      done();
    });
  });

  it("should be the ending boundary alone (undefined object)", function (done) {
    var form = Teaform();
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      var boundary = boundaryFromHeader(form.headers['Content-Type']);
      expect(formDataBody).toBe('--' + boundary + '--');
      done();
    });
  });

  it("should provide correct Content-Length", function (done) {
    var form = Teaform({});
    var contentLength = form.headers['Content-Length'];
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      expect(Buffer(formDataBody).length).toBe(contentLength);
      done();
    });
  });
});
