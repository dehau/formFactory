/* jshint esnext: true, undef: true, unused: true */
/* global window, FormData */
window.formFactory = (fields = {}, fileField = null) => {
  var form = new FormData();
  Object.keys(fields)
    .forEach(fieldName => form.append(fieldName, fields[fieldName]));
  if(fileField && Object.keys(fileField).length) {
    var fieldName = Object.keys(fileField)[0];
    var file = fileField[fieldName];
    form.append(fieldName, file, file.name);
  }
  return form;
};
