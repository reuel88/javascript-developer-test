const { httpGet } = require('./mock-http-interface');

const SUCCESS_CODE = 200;
const SUCCESS_KEY = 'Arnie Quote';

const ERROR_KEY = 'FAILURE';
const ERROR_NAME = 'HttpError'
const ERROR_INVALID_JSON = 'Invalid JSON response'
const ERROR_EMPTY_BODY = 'Empty response body'
const ERROR_INVALID_STRUCTURE = 'Invalid response structure'
const ERROR_INTERNAL_SERVER = 'Internal Server Error'

class HttpError extends Error {
    constructor(message) {
        super(message);
        this.name = ERROR_NAME;
    }
}

const createErrorResponse = (error) => {
    return {
        [ERROR_KEY]: error.message,
    }
}

const handleError = (error) => {
    if (error instanceof SyntaxError) {
        const parseError = new HttpError(ERROR_INVALID_JSON);
        return createErrorResponse(parseError);
    }

    if (error instanceof HttpError) {
        return createErrorResponse(error);
    }

    const unknownError = new HttpError(ERROR_INTERNAL_SERVER);
    return createErrorResponse(unknownError);
}

const processUrl = async (url) => {
    try {
        const response = await httpGet(url);

        if (!response.body) {
            throw new HttpError(ERROR_EMPTY_BODY);
        }

        const result = JSON.parse(response.body);

        if (!result.message) {
            throw new HttpError(ERROR_INVALID_STRUCTURE);
        }

        if (response.status !== SUCCESS_CODE) {
            throw new HttpError(result.message || ERROR_INTERNAL_SERVER);
        }

        return {
            [SUCCESS_KEY]: result.message,
        }
    } catch (error) {
        return handleError(error)
    }
}

const getArnieQuotes = async (urls) => {
    const promises = urls.map(processUrl)
    return Promise.all(promises);
};

module.exports = {
  getArnieQuotes,
};
