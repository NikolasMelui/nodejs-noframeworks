/**
 * Frontend logic for the application
 */

const app = {
  config: {
    sessionToken: false
  },
  // AJAX client for the restful API
  client: {
    requust: (headers, path, method, queryStringObject, payload, callback) => {}
  }
};

console.log('Hello there!');
