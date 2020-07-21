// Loads all the environment variables from a .env file before using them
// @see https://github.com/motdotla/dotenv/tree/v6.1.0#how-do-i-use-dotenv-with-import
import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import { log } from "./logger";

/**
 * Checks that the environment variables with the provided name is defined,
 * if it is undefined logs an error and exits the process
 * @param varName [string] The name of the required environment variables
 */
export function getRequiredEnvVar(varName: string): string | never {
  const envVar = process.env[varName];
  if (envVar === undefined) {
    log.error("Required environment variable missing: %s", varName);
    return process.exit(1);
  }
  return envVar;
}

/**
 * Reads a file from the filesystem..
 *
 * @param path
 * @param type
 * @returns {string}
 */
export function readFile(path: string, type: string): string {
  log.info("Reading %s file from %s", type, path);
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.readFileSync(path, "utf-8");
}
