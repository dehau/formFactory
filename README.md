# formFactory [![Circle CI](https://circleci.com/gh/dehau/formFactory.svg?style=svg)](https://circleci.com/gh/dehau/formFactory)

* A simple form factory for both node and the browser
* Describe forms using `json objects`
* Multipart/formdata
* UTF-8
* File upload
* Streamed in the node version

## How to use it ?

### With node

```cmd
npm install formFactory
```

```js
//Amazon S3 POST example
var https = require('https');
var url = require('url');
var fs = require('fs');
var s3Endpoint = 'https://s3-us-west-2.amazonaws.com/42';
var path = './images/john.png'
var formFactory = require('formFactory');
var form = formFactory({
  key: 'images/john.png',
  AWSAccessKeyId: 'AKIAIAVVU5KANH5LYROZ',
  'Content-Type': 'image/png',
  success_action_status: 201,
  acl: 'private',
  'x-amz-meta-filename': 'john.png',
  policy: 'eyJleHBpcmF0aW9uIjoiMjAxNS0wN...',
  signature: 'rdvA5qlKbSry/W1JuwKoZHvulhc='
}, {
  //Please note that file key could be any key
  //and will be used as field name for the file
  file: {
    stream: fs.createReadStream(path),
    name: path.split('/').pop(),
    type: 'image/png',
    size: fs.statSync(path).size
  }
});
var headers = form.headers;
var body = form.body;//Stream

//Send the request
var options = url.parse(s3Endpoint);
options.headers = headers;
options.method = 'POST';
var request = https.request(options, function(res) {
  if(res.statusCode === 201) {
    console.log('file saved to S3 !');
  }
});
body.pipe(request);
```

### In the browser

```cmd
bower install formFactory
```

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- Amazon S3 POST example -->
    <script src="bower_components/formFactory/browserVersion.js"> </script>
    <script>
      var s3Endpoint = 'https://s3-us-west-2.amazonaws.com/42';
      var input = document.getElementById('file');
      //Wait for user selection
      input.addEventListener('change', function(evt) {
        var file = evt.target.files[0];

        //Create form
        var form = formFactory({
          key: 'images/john.png',
          AWSAccessKeyId: 'AKIAIAVVU5KANH5LYROZ',
          'Content-Type': 'image/png',
          success_action_status: 201,
          acl: 'private',
          'x-amz-meta-filename': 'john.png',
          policy: 'eyJleHBpcmF0aW9uIjoiMjAxNS0wN...',
          signature: 'rdvA5qlKbSry/W1JuwKoZHvulhc='
        }, {
          file: file
        });

        //Send the request
        var xhr2 = new XMLHttpRequest();
        xhr2.addEventListener('load', function() {
          console.log('file saved to S3 !');
        });
        xhr2.open('POST', s3Endpoint);
        xhr2.send(form);
      });
    </script>
  </head>
  <body>
    <input type="file" id="file">
  </body>
</html>

```
