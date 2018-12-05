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

      // For each query string parameter sent, add it to the path
      const requestUrl = [`${path}?`];
      for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
          // If there is more than one querystring parameter has been added
          if (requestUrl.length > 1) {
            requestUrl.push('&');
          }
          // Add the key and value
          requestUrl.push(`${queryKey}=${queryStringObject[queryKey]}`);
        }
      }
      // Join requestUrl array to the string
      requestUrl = requestUrl.join('');
    }
  }
};
