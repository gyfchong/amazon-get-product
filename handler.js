'use strict';
const got = require('got');
const hmacSHA256 = require('crypto-js/hmac-sha256');
const Base64 = require('crypto-js/enc-base64');
const moment = require('moment');
const convert = require('xml-js');
const queryString = require('query-string');
const aws = require('aws-lib');

const getProduct = (options) => new Promise(
  (resolve, reject) => {
    const prodAdv = aws.createProdAdvClient(process.env.AWS_API_KEY, process.env.AWS_API_SECRET, 'wishbones-02');

    prodAdv.call("ItemLookup", options, function(err, result) {

      if (err) {
        reject('Something went wrong with the request to Amazon API -- Probably aws-lib fault');
      }

      if (result) {
        const errors = result.Items.Request.Errors;

        if (errors !== undefined) {
          reject(errors.Error.Message);
        } else {
          resolve(result.Items.Item.ItemAttributes);
        }
      }

    });
  }
);

module.exports.helloWorld = (event, context, callback) => {

  const options = {
    ItemId: 'B010TU7LP2',
    ResponseGroup: 'ItemAttributes',
  };

  getProduct(options).then((product) => {
    callback(null, {
      statusCode: 200,
      body: {
        title: product.Title,
        price: product.ListPrice.FormattedPrice
      }
    });
  })
  .catch((error) => {
    callback(null, {
      statusCode: 400,
      body: error
    });
  });



};
