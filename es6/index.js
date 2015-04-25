/* jshint esnext: true, undef: true, unused: true */
/* global require, module, Buffer */
let PassThroughStream = require('stream').PassThrough;

let generatePart = (boundary, key, value, filename, contentType) => {
 return [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${key}"` +
    `${filename ? `; filename="${filename}"` : ''}`,
    `${contentType ? `Content-Type: ${contentType}\r\n` : ''}`,
    `${value ? `${value}` : ''}`
 ].join('\r\n');
};

let attachFile = (boundary, fileField, outputStream) => {
  let fieldName = Object.keys(fileField)[0];
  let {stream, name, size, type} = fileField[fieldName];
  type = type || 'application/octet-stream';
  let filePart = generatePart(boundary, fieldName, null, name, type);
  size += Buffer.byteLength(filePart, 'utf8');
  outputStream.push(filePart, 'utf8');
  //end file content by a new line
  stream.pipe(outputStream, {end: false});
  stream.on('end', () => outputStream.end(`\r\n--${boundary}--`, 'utf8'));
  return size + Buffer.byteLength(`\r\n--${boundary}--`, 'utf8');
};

//From felixge/node-form-data
let generateBoundary = () => {
 // This generates a 50 character boundary similar to those used by Firefox.
 // They are optimized for boyer-moore parsing.
 let boundary = '--------------------------';
 for (let i = 0; i < 24; i++) {
   boundary += Math.floor(Math.random() * 10).toString(16);
 }
 return boundary;
};
//fields : {field1Name: field1Value, field2Name: field2Value, ...}
//fileField : { fileFieldName: { stream, name, size, type } }
module.exports = function formFactory(fields = {}, fileField = null) {
  let contentLength = 0;
  let boundary = generateBoundary();
  let bodyStream = new PassThroughStream();
  //Each form parts except fileField
  Object.keys(fields)
    .map(key => generatePart(boundary, key, fields[key]) + '\r\n')
    .forEach(part => {
      contentLength += Buffer.byteLength(part, 'utf8');
      bodyStream.push(part, 'utf8');
    });
  //File part
  if(fileField) {
    contentLength += attachFile(boundary, fileField, bodyStream);
  } else {
    bodyStream.end(`--${boundary}--`, 'utf8');
    contentLength += Buffer.byteLength(`--${boundary}--`, 'utf8');
  }
  return {
    body: bodyStream,
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}; charset=utf-8`,
      'Content-Length': contentLength
    }
  };
};
