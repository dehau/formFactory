/* jshint esnext: true, undef: true, unused: true */
/* global window, FormData */
"use strict";

window.Revolution = function () {
  var fields = arguments[0] === undefined ? {} : arguments[0];
  var fileField = arguments[1] === undefined ? null : arguments[1];

  var form = new FormData();
  Object.keys(fields).forEach(function (fieldName) {
    return form.append(fieldName, fields[fieldName]);
  });
  if (fileField && Object.keys(fileField).length) {
    var fieldName = Object.keys(fileField)[0];
    var file = fileField[fieldName];
    form.append(fieldName, file, file.name);
  }
  return form;
};