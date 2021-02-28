"use strict";
var fs = require('fs');
var to_postman_converter = require('openapi-to-postmanv2');
var to_openapi_converter = require('swagger2openapi');
var yaml = require('js-yaml');

var file = fs.readFileSync('sample.swagger.yaml', {encoding: 'UTF8'});
var data = yaml.load(file);
if (data.openapi) {
  to_postman_converter.convert({ type: 'string', data: data }, {}, to_postman_callback);
  to_openapi.openapi
} else if (data.swagger) {
  to_openapi_converter.convertObj(data, {}, function (err, to_openapi) {
    if (err) { 
      console.error(err);
      process.exit(1);
    }
    if (to_openapi) {
      to_postman_converter.convert({type: 'string', data: to_openapi.openapi}, {}, to_postman_callback);
    }
  });
} else {
  console.error('input yaml is neither swagger nor openapi!');
  process.exit(1);
}

var to_postman_callback = function (err, to_postman) {
  if (!to_postman.result) {
    console.error(to_postman.reason);
    process.exit(1);
  }
  if (to_postman && to_postman.output) {
    fs.writeFile('sample-swagger-postman-collection.json', JSON.stringify(to_postman.output[0].data), {}, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  }
  if (err) { 
    console.error(err);
    process.exit(1);
  }
}


