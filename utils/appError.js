class appError extends Error {
     constructor(message, statusCode) {
          super(message);
          this.statusCode = statusCode;
          this.message = message;
          this.status = `${this.statusCode}`.startsWith('4') ? 'Fail' : 'Error';
          this.isOperational = true;
          // this code is used to trace error where it is happend also by useing this.constructer will not apear and polute it
          Error.captureStackTrace(this, this.constructor);
     }
}

module.exports = appError;
