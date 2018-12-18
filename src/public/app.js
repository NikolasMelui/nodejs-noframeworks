/**
 * Frontend logic for the application
 */

const app = {
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
      const requestUrlArray = [`${path}?`];
      for (let queryKey in queryStringObject) {
        if (queryStringObject.hasOwnProperty(queryKey)) {
          // If there is more than one querystring parameter has been added
          if (requestUrlArray.length > 1) {
            requestUrlArray.push('&');
          }
          // Add the key and value
          requestUrlArray.push(`${queryKey}=${queryStringObject[queryKey]}`);
        }
      }
      // Join requestUrl array to the string
      const requestUrl = requestUrlArray.join('');

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

      const payloadString = JSON.stringify(payload);
      xhr.send(payloadString);
    }
  },

  bindForms: () => {
    const submitButtons = document.querySelector('form');
    if (submitButtons !== null) {
      submitButtons.addEventListener('submit', event => {
        // Stop it from submitting
        event.preventDefault();
        const formId = event.target.id;
        const path = event.target.action;
        const method = event.target.method.toUpperCase();

        // Hide the error message (if it's currently show due to a previous error)
        console.log(formId);
        document.querySelector(`#${formId} .formError`).style.display =
          'hidden';

        // Turn the inputs into a payload
        const payload = {};
        const elements = event.target.elements;

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].type !== 'submit') {
            payload[elements[i].name] =
              elements[i].type == 'checkbox'
                ? elements[i].checked
                : elements[i].value;
          }
        }

        // Call the API
        app.client.request(
          undefined,
          path,
          method,
          undefined,
          payload,
          (statusCode, responsePayload) => {
            // Display an error on the form if needed
            if (statusCode !== 200) {
              // Try to get the error from the API, or set a default error message
              const error =
                typeof responsePayload.Error === 'string'
                  ? responsePayload.Error
                  : 'An error has occured, please try again';
              // Set the formError field with the error text
              document.querySelector(`#${formId} .formError`).innerHTML = error;
              // Show the form error field
              document.querySelector(`#${formId} .formError`).style.display =
                'block';
            }
            // If there is no error - send to form response processor
            app.formResponseProcessor(formId, payload, responsePayload);
          }
        );
      });
    }
  },
  formResponseProcessor: (formId, requestPayload, responsePayload) => {
    const functionToCall = false;
    // If account creation was successful, try to immediately log the user in
    if (formId === 'accountCreate') {
      // Take the phone and password and use it to log the user in
      const newPayload = {
        phone: requestPayload.phone,
        password: requestPayload.password
      };
      app.client.request(
        undefined,
        'api/tokens',
        'POST',
        undefined,
        newPayload,
        (newStatusCode, newResponsePayload) => {
          // Display an error of the form if needed
          if (newStatusCode !== 200) {
            // Set the formError field with the error text
            document.querySelector(`#${formId} .formError`).innerHTML =
              'Sorry, an error has occured. Please try again.';
            // Show the form error field
            document.querySelector(`#${formId} .formError`).style.display =
              'block';
          } else {
            // If successfull, set the token and redirect the user
            app.setSessionToken(newResponsePayload);
            window.location = '/checks/all';
          }
        }
      );
    }
    // If login was successful, set the token in localstorage and redirect the user
    if (formId === 'sessionCreate') {
      app.setSessionToken(responsePayload);
      window.location = '/checks/all';
    }
  },
  getSessionToken: () => {
    const tokenString = localStorage.getItem('token');
    if (typeof tokenString === 'string') {
      try {
        const token = JSON.parse(tokenString);
        app.config.sessionToken = token;
        if (typeof token === 'object') {
          app.setLoggedInClass(true);
        } else {
          app.setLoggedInClass(false);
        }
      } catch (e) {
        app.config.sessionToken = false;
        app.setLoggedInClass(false);
      }
    }
  },

  // Set (or remove) the loggedIn class from the body
  setLoggedInClass: add => {
    const target = document.querySelector('body');
    if (add) {
      target.classList.add('loggedIn');
    } else {
      target.classList.remove('loggedIn');
    }
  },

  setSessionToken: token => {
    app.config.sessionToken = token;
    const tokenString = JSON.stringify(token);
    localStorage.setItem('token', tokenString);
    if (typeof token === 'object') {
      app.setLoggedInClass(true);
    } else {
      app.setLoggedInClass(false);
    }
  },

  // Init the app
  init: () => {
    // Bind all form submissions
    app.bindForms();

    // Get the token from the localstorage
    app.getSessionToken();

    // Renew token
    app.tokenRenewalLoop();
  }
};

// Call the init processes after the window loads
window.onload = () => app.init();
