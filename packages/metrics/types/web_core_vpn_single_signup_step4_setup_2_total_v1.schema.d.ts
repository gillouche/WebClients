/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Measures the total step 4 setup success and failures
 */
export interface WebCoreVpnSingleSignupStep4Setup2Total {
  Value: number;
  Labels: {
    status: "success" | "failure" | "4xx" | "5xx";
    flow: "b2c" | "b2b";
  };
}
