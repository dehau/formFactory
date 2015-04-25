var Teaform = require("..");
var boundaryFromHeader = require('./helpers').boundaryFromHeader;
var parseSimpleForm = require('./helpers').parseSimpleForm;

var simpleFormFields = {
  firstName: 'John',
  lastName:  'Locke'
};

describe("simple form", function () {
  it("should use \\r\\n line separator", function (done) {
    var form = Teaform(simpleFormFields);
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      //6 for the two form fields + 1 intermediate boundary + start and end boundaries
      expect(formDataBody.split('\r\n').length).toBe(9);
      done();
    });
  });

  it("should use 50 character boundaries", function () {
    var form = Teaform(simpleFormFields);
    var formDataBody = '';
    expect(boundaryFromHeader(form.headers['Content-Type']).length).toBe(50);
  });

  it("should use -- prefixed and sufixed boundaries", function (done) {
    var form = Teaform(simpleFormFields);
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      var boundary = boundaryFromHeader(form.headers['Content-Type']);
      expect(formDataBody.split('\r\n')[0]).toBe('--' + boundary);
      expect(formDataBody.split('\r\n')[4]).toBe('--' + boundary);
      expect(formDataBody.split('\r\n')[8]).toBe('--' + boundary + '--');
      done();
    });
  });

  it("should provide correct Content-Length", function (done) {
    var form = Teaform(simpleFormFields);
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

  it("should provide correct fields name and value", function (done) {
    var form = Teaform(simpleFormFields);
    var boundary = boundaryFromHeader(form.headers['Content-Type']);
    var contentLength = form.headers['Content-Length'];
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      var formFields = parseSimpleForm(formDataBody, boundary);
      expect(formFields).toEqual(simpleFormFields);
      done();
    });
  });
});
