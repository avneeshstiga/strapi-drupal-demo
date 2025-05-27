"use strict";

import { LoggingWinston } from "@google-cloud/logging-winston";
import winston from "winston";

// Create Google Cloud Logging transport
const loggingWinston = new LoggingWinston();

export default ({ env }) => ({
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    loggingWinston, // Push logs to Firebase/GCP Logging
  ],
});
