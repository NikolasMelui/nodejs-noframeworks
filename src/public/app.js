/**
 * Frontend logic for the application
 */

const apps = {
  config: {
    sessionToken: false
  },
  // AJAX client for the restful API
  client: {
    request: (headers, path, method, queryStringObject, payload, callback) => {
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

      const xhr = new XMLHttpRequest();
      xhr.open(method, requestUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');

      // For each header sent, add it to the request
      for (let headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
          xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
      }

      // If there is a current session token set, add that as a header
      if (app.config.sessionToken) {
        xhr.setRequestHeader('token', app.config.sessionToken.id);
      }

      // When the request come back, handle the response
      xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          const statusCode = xhr.status;
          const responseReturned = xhr.responseText;

          // Callback if requested

          if (callback) {
            try {
              const parsedResponse = JSON.parse(responseReturned);
              callback(statusCode, parsedResponse);
            } catch (error) {
              callback(statusCode, false);
            }
          }
        }
      };
    }
  }
};
