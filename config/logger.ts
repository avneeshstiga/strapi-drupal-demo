"use strict";

const { LoggingWinston } = require("@google-cloud/logging-winston");
const winston = require("winston");

// Create Google Cloud Logging transport
const loggingWinston = new LoggingWinston();

module.exports = ({ env }) => ({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    loggingWinston, // Push logs to Firebase/GCP Logging
  ],
});
