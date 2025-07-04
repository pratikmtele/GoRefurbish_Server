class Response {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.statusCode < 400 ? this.success = true : this.success = false;
    }
} 

export default Response;