/**
 * Frontend logic for the application
 */

const app = {
  config: {
    sessionToken: false
  },
  // AJAX client for the restful API
  client: {
    requust: (headers, path, method, queryStringObject, payload, callback) => {
      // Set defaults
      headers = typeof headers === 'object' && headers !== null ? headers : {};
      path = typeof path === 'string' ? path : '/';
      method =
        typeof method === 'string' &&
        ['POST', 'GET', 'PUT', 'DELETE'].includes(method)
          ? method.toUpperCase()
          : 'GET';
      queryStringObject =
        typeof queryStringObject === 'object' && queryStringObject !== null
          ? queryStringObject
          : {};
      payload = typeof payload === 'object' && payload !== null ? payload : {};
      callback = typeof callback === 'function' ? callback : false;
    }
  }
};

console.log('Hello there!');
