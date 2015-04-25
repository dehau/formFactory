/* jshint esnext: true, undef: true, unused: true */
/* global require, module, Buffer */
'use strict';

var PassThroughStream = require('stream').PassThrough;

var generatePart = function generatePart(boundary, key, value, filename, contentType) {
  return ['--' + boundary, 'Content-Disposition: form-data; name="' + key + '"' + ('' + (filename ? '; filename="' + filename + '"' : '')), '' + (contentType ? 'Content-Type: ' + contentType + '\r\n' : ''), '' + (value ? '' + value : '')].join('\r\n');
};

var attachFile = function attachFile(boundary, fileField, outputStream) {
  var fieldName = Object.keys(fileField)[0];
  var _fileField$fieldName = fileField[fieldName];
  var stream = _fileField$fieldName.stream;
  var name = _fileField$fieldName.name;
  var size = _fileField$fieldName.size;
  var type = _fileField$fieldName.type;

  type = type || 'application/octet-stream';
  var filePart = generatePart(boundary, fieldName, null, name, type);
  size += Buffer.byteLength(filePart, 'utf8');
  outputStream.push(filePart, 'utf8');
  //end file content by a new line
  stream.pipe(outputStream, { end: false });
  stream.on('end', function () {
    return outputStream.end('\r\n--' + boundary + '--', 'utf8');
  });
  return size + Buffer.byteLength('\r\n--' + boundary + '--', 'utf8');
};

//From felixge/node-form-data
var generateBoundary = function generateBoundary() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  var boundary = '--------------------------';
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }
  return boundary;
};
//fields : {field1Name: field1Value, field2Name: field2Value, ...}
//fileField : { fileFieldName: { stream, name, size, type } }
module.exports = function formFactory() {
  var fields = arguments[0] === undefined ? {} : arguments[0];
  var fileField = arguments[1] === undefined ? null : arguments[1];

  var contentLength = 0;
  var boundary = generateBoundary();
  var bodyStream = new PassThroughStream();
  //Each form parts except fileField
  Object.keys(fields).map(function (key) {
    return generatePart(boundary, key, fields[key]) + '\r\n';
  }).forEach(function (part) {
    contentLength += Buffer.byteLength(part, 'utf8');
    bodyStream.push(part, 'utf8');
  });
  //File part
  if (fileField) {
    contentLength += attachFile(boundary, fileField, bodyStream);
  } else {
    bodyStream.end('--' + boundary + '--', 'utf8');
    contentLength += Buffer.byteLength('--' + boundary + '--', 'utf8');
  }
  return {
    body: bodyStream,
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary + '; charset=utf-8',
      'Content-Length': contentLength
    }
  };
};