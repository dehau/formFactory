function boundaryFromHeader (header) {
  return header.split(';')[1].split('boundary=')[1];
}

var NAME_REGEX = /form-data;.*name="(.*)"/;
var CONTENT_TYPE_REGEX = /Content-Type:\s*(.*)/;

function parseSimpleForm(formBody, boundary) {
  var fields = formBody.split('--' + boundary).slice(1, -1);
  var fieldsHash = {};
  fields.forEach(function(field) {
    var name = (field.match(NAME_REGEX) || [])[1];
    var contentType = (field.match(CONTENT_TYPE_REGEX)  || [])[1];
    var value = field.split('\r\n').slice(contentType ? 3 : 2).join('');
    fieldsHash[name] = value;
  });
  return fieldsHash;
}

function extractFilePart(formStream, boundary, cb) {
  var formDataBody = '';
  formStream.on('data', function(chunck) {
    //Hex encoding preserve file binary information
    formDataBody += chunck.toString('hex');
  });
  formStream.on('end', function() {
    //9 for the two form fields + 2 intermediate boundary + start and end boundaries
    // + 1 file contentType
    var parts = formDataBody.split(Buffer(boundary).toString('hex'));
    parts.pop();
    var filePart = parts.pop();
    var lines = filePart.split(Buffer('\r\n').toString('hex'));
    lines.pop();
    var filePartParsed = {
      fileContent: lines.pop(),
      //Restore utf8 encoding
      contentDisposition: new Buffer(lines[1], 'hex').toString(),
      contentType: new Buffer(lines[2], 'hex').toString()
    };
    cb(null, filePartParsed);
  });
}

module.exports = {
  boundaryFromHeader: boundaryFromHeader,
  parseSimpleForm: parseSimpleForm,
  extractFilePart: extractFilePart
};
