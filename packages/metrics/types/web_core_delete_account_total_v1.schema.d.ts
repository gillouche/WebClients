/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Measures the total delete account attempt success and failures
 */
export interface WebCoreDeleteAccountTotal {
  Value: number;
  Labels: {
    status: "success" | "failure" | "4xx" | "5xx";
    source: "account" | "lite-account";
  };
}
