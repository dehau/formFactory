var Teaform = require("..");
var boundaryFromHeader = require('./helpers').boundaryFromHeader;
var extractFilePart = require('./helpers').extractFilePart;
var fs = require('fs');

var simpleForm = {
  firstName: 'John',
  lastName:  'Locke'
};

//This file does not contain \r\n
var filePath = 'spec/fixtures/informed.jpg';
var fileFieldFactory = function() {
  return {
    file: {
      stream: fs.createReadStream(filePath),
      name: filePath.split('/').pop(),
      type: 'image/jpg',
      size: fs.statSync(filePath).size
    }
  };
};

describe("file form", function () {
  it("should use \\r\\n line separator", function (done) {
    var form = Teaform(simpleForm, fileFieldFactory());
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck.toString();
    });
    form.body.on('end', function() {
      //9 for the two form fields + 2 intermediate boundary + start and end boundaries
      // + file contentType
      expect(formDataBody.split('\r\n').length).toBe(14);
      done();
    });
  });

  it("should send the jpg file unmodified", function (done) {
    var form = Teaform(simpleForm, fileFieldFactory());
    var boundary = '--' + boundaryFromHeader(form.headers['Content-Type']);
    extractFilePart(form.body, boundary, function(err, formPart) {
      var formFileContent = formPart.fileContent;
      var fileStream = fileFieldFactory().file.stream;
      var fileContent = '';
      fileStream.on('data', function(chunck) {
        fileContent += chunck.toString('hex');
      });
      fileStream.on('end' , function() {
        //sent file is still a jpg file
        expect(formFileContent.slice(0,8)).toBe('ffd8ffe0');
        //sent file is the same as local file
        expect(formFileContent).toBe(fileContent);
        done();
      });
    });
  });

  it("should send correct filename and file ContentType", function (done) {
    var form = Teaform(simpleForm, fileFieldFactory());
    var boundary = '--' + boundaryFromHeader(form.headers['Content-Type']);
    extractFilePart(form.body, boundary, function(err, formPart) {
      expect(formPart.contentDisposition).toBe(
        'Content-Disposition: form-data; name="file"; filename="informed.jpg"'
      );
      expect(formPart.contentType).toBe(
        'Content-Type: image/jpg'
      );
      done();
    });
  });

  it("should use 50 character boundaries", function () {
    var form = Teaform(simpleForm, fileFieldFactory());
    expect(boundaryFromHeader(form.headers['Content-Type']).length).toBe(50);
  });

  it("should use -- prefixed and sufixed boundaries", function (done) {
    var form = Teaform(simpleForm, fileFieldFactory());
    var formDataBody = '';
    form.body.on('data', function(chunck) {
      formDataBody += chunck;
    });
    form.body.on('end', function() {
      var boundary = boundaryFromHeader(form.headers['Content-Type']);
      expect(formDataBody.split('\r\n')[0]).toBe('--' + boundary);
      expect(formDataBody.split('\r\n')[4]).toBe('--' + boundary);
      expect(formDataBody.split('\r\n')[8]).toBe('--' + boundary);
      expect(formDataBody.split('\r\n')[13]).toBe('--' + boundary + '--');
      done();
    });
  });

  it("should provide correct Content-Length", function (done) {
    var form = Teaform(simpleForm, fileFieldFactory());
    var contentLength = form.headers['Content-Length'];
    var formDataLength = 0;
    form.body.on('data', function(chunck) {
      formDataLength += Buffer(chunck).length;
    });
    form.body.on('end', function() {
      expect(formDataLength).toBe(contentLength);
      done();
    });
  });
});
