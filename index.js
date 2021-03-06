'use strict';
var fs = require('fs');
var path = require('path');
var postman_converter = require('openapi-to-postmanv2');
var openapi_converter = require('swagger2openapi');
var yaml = require('js-yaml');
var _ = require('lodash');

var postman_collection_writer = function (target_directory, postman_filename) { 
  return function (err, postman_conversion) {
    if (!postman_conversion.result) {
      console.error(postman_conversion.reason);
      process.exit(1);
    }
    if (postman_conversion && postman_conversion.output) {
      fs.writeFile(target_directory + postman_filename, JSON.stringify(postman_conversion.output[0].data), {}, (err) => {
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
}

function convert(path_to_specs, spec_filename, target_directory) {
  var name_token = _.head(_.split(path.basename(spec_filename), /.yaml$|.yml$/, 1));
  var postman_filename = name_token + '-postman-collection.json';
  
  var file = fs.readFileSync(path_to_specs+ spec_filename, { encoding: 'UTF8' });
  var yaml_file = yaml.load(file);
  if (yaml_file.openapi) {
    postman_converter.convert({ type: 'string', data: yaml_file }, {}, postman_collection_writer(target_directory, postman_filename));
  } else if (yaml_file.swagger) {
    openapi_converter.convertObj(yaml_file, {}, function (err, open_api_conversion) {
      if (err) { 
        console.error(err);
        process.exit(1);
      }
      if (open_api_conversion) {
        postman_converter.convert({type: 'string', data: open_api_conversion.openapi}, {}, postman_collection_writer(target_directory, postman_filename));
      }
    });
  } else {
    console.error('input yaml is neither swagger nor openapi!');
    process.exit(1);
  }
}

function convert_all(path_to_specs, target_directory) {
  fs.readdir(path_to_specs, function (err, files) { 

    if (err) { 
      console.error(err);
      process.exit(1);
    }
    fs.Dir
    files.forEach(f => convert(path_to_specs, f, target_directory));
  });
}

var path_to_specs = 'files/'
var target_directory = 'target/';
fs.rmdirSync(target_directory, {force: true, recursive: true});
fs.mkdirSync(target_directory);
convert_all(path_to_specs, target_directory);