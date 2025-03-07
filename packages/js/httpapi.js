const request = require('request');
const Comparer = require('./comparer.js');
const Constants = require('../../src/constants.js');

/**
 * Wraps HTTP request/response functionality
 * Stores response in a Response object, which can be quickly verified with a Comparer expected object
 */
class HttpApi {
    /**
     * @param {RunInstance} [runInstance] - The current RunInstance
     */
    constructor(runInstance) {
        this.runInstance = runInstance;
    }

    /**
     * Makes an HTTP request using the given request library function and args
     * For internal use only
     * See request() in https://github.com/request/request for details on functions that can be used
     * @return {Promise} Promise that resolves with a Response object, when it is received. Response will also be stored in {response} global variable.
     */
    makeReq(func) {
        let args = Array.from(arguments).slice(1);
        let uri = '';
        if(typeof args[0] == 'string') {
            uri = args[0];
        }
        else if(typeof args[0] == 'object') {
            if(args[0].uri) {
                uri = args[0].uri;
            }
            else if(args[0].url) {
                uri = args[0].url;
            }
        }
        else if(typeof args[1] == 'object') {
            if(args[1].uri) {
                uri = args[1].uri;
            }
            else if(args[1].url) {
                uri = args[1].url;
            }
        }

        let method = 'GET';
        if(typeof args[0] == 'object' && args[0].hasOwnProperty('method')) {
            method = args[0].method;
        }
        else if(typeof args[1] == 'object' && args[1].hasOwnProperty('method')) {
            method = args[1].method;
        }

        this.runInstance.log(`Request:\n  ${method.toUpperCase()} ${uri}\n`);

        return new Promise((resolve, reject) => {
            func(...args, (error, response, body) => {
                let responseObj = new HttpApi.Response(this.runInstance, error, response, body);
                this.runInstance.g('response', responseObj);
                resolve(responseObj);
            });
        });
    }

    /**
     * Makes an HTTP request
     * See request() in https://github.com/request/request for details
     * @return {Promise} Promise that resolves when response comes back. Response will be stored in {response} variable.
     */
    request() {
        return this.makeReq(request, ...Array.from(arguments));
    }

    /**
     * Sets default options for HTTP requests
     * See defaults() in https://github.com/request/request for details
     */
    defaults(options) {
        return request.defaults(options);
    }

    /**
     * Makes an HTTP GET request
     * See this.makeReq() for details on args and return value
     */
    get() {
        return this.makeReq(request.get, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP POST request
     * See this.makeReq() for details on args and return value
     */
    post() {
        return this.makeReq(request.post, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP PUT request
     * See this.makeReq() for details on args and return value
     */
    put() {
        return this.makeReq(request.put, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP PATCH request
     * See this.makeReq() for details on args and return value
     */
    patch() {
        return this.makeReq(request.patch, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP DELETE request
     * See this.makeReq() for details on args and return value
     */
    del() {
        return this.makeReq(request.del, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP HEAD request
     * See this.makeReq() for details on args and return value
     */
    head() {
        return this.makeReq(request.head, ...Array.from(arguments));
    }

    /**
     * Makes an HTTP OPTIONS request
     * See this.makeReq() for details on args and return value
     */
    options() {
        return this.makeReq(request.options, ...Array.from(arguments));
    }

    /**
     * Creates a new cookie
     * See request.cookie() in https://github.com/request/request for details
     */
    cookie(str) {
        return request.cookie(str);
    }

    /**
     * Creates a new cookie jar
     * See request.jar() in https://github.com/request/request for details
     */
    jar() {
        return request.jar();
    }
}
module.exports = HttpApi;

/**
 * Response that comes from an API call
 */
HttpApi.Response = class Response {
    constructor(runInstance, error, response, body) {
        this.runInstance = runInstance;
        this.response = {
            statusCode: response && response.statusCode,
            headers: response && response.headers,
            error: error,
            body: body,
            rawBody: body,
            response: response
        };

        // If body is json, parse it
        try {
            this.response.body = JSON.parse(this.response.body);
        }
        catch(e) {}
    }

    /**
     * @throws {Error} If expectedObj doesn't match json response (see comparer.js, Comparer.expect())
     */
    verify(expectedObj) {
        let headersLog = ``;
        if(this.response.headers) {
            for(let headerName in this.response.headers) {
                if(this.response.headers.hasOwnProperty(headerName)) {
                    headersLog += `  ${headerName}: ${this.response.headers[headerName]}\n`;
                }
            }
        }

        let rawBody = this.response.rawBody;
        if(typeof rawBody == 'string') {
        }
        else if(typeof rawBody == 'object') {
            rawBody = JSON.stringify(rawBody);
        }
        else {
            rawBody = `[${typeof rawBody}]`;
        }

        let responseLog = `Response:\n  ${this.response.statusCode}\n\n${headersLog}\n\n${rawBody.replace(/(.*)/g, '  $1')}`;
        this.runInstance.log(responseLog);

        Comparer.expect(this.response, undefined, undefined, 'Actual response object:').to.match(expectedObj);
    }
}
