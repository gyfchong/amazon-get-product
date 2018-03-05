'use strict';
const aws = require('aws-lib');

const getProduct = (options) => new Promise(
  (resolve, reject) => {
    const prodAdv = aws.createProdAdvClient(process.env.PRODUCT_API_KEY, process.env.PRODUCT_API_SECRET, process.env.PRODUCT_ASSOC_TAG);

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

module.exports.amazonGetProduct = (event, context, callback) => {

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
