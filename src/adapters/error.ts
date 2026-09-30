import platform from "platform";
import * as StackTrace from "stacktrace-js";
import { ZodError, z } from "zod";

import {
  EthersInsufficientFundsError,
  MetaMaskResourceUnavailableError,
  MetaMaskUnknownChainError,
  MetaMaskUserRejectedRequestError,
  ProviderError,
  ReportFormEnvEnabled,
} from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

type MessageKeyError = {
  message: string;
};

const messageKeyErrorParser = StrictSchema<MessageKeyError>()(
  z.object({
    message: z.string(),
  })
);

export type JsonRpcError = {
  code: number;
  data: {
    code: number;
    message: string;
  };
  message: string;
};

export const jsonRpcError = StrictSchema<JsonRpcError>()(
  z.object({
    code: z.number(),
    data: z.object({
      code: z.number(),
      message: z.string(),
    }),
    message: z.string(),
  })
);

export const metaMaskUserRejectedRequestError = StrictSchema<MetaMaskUserRejectedRequestError>()(
  z.object({
    code: z.union([z.literal(4001), z.literal("ACTION_REJECTED")]),
    message: z.string(),
  })
);

export const metaMaskResourceUnavailableError = StrictSchema<MetaMaskResourceUnavailableError>()(
  z.object({
    code: z.literal(-32002),
    message: z.string(),
  })
);

export const ethersInsufficientFundsError = StrictSchema<EthersInsufficientFundsError>()(
  z.object({
    code: z.literal("INSUFFICIENT_FUNDS"),
    reason: z.string(),
  })
);

export const metaMaskUnknownChainError = StrictSchema<MetaMaskUnknownChainError>()(
  z.object({
    code: z.literal(4902),
    message: z.string(),
  })
);

export const providerError = StrictSchema<ProviderError>()(z.nativeEnum(ProviderError));

function sanitizeErrorMessage(errorMessage: string): string {
  try {
    return JSON.stringify(JSON.parse(errorMessage));
  } catch (error) {
    const selectMultipleTabsAndSpaces = /[^\S\r\n]{2,}/g;
    return errorMessage.replaceAll(selectMultipleTabsAndSpaces, " ");
  }
}

export function parseError(error: unknown): Promise<string> {
  console.error(error);
  const unknownError = Promise.resolve(`An unknown error has occurred: ${JSON.stringify(error)}`);
  if (typeof error === "string") {
    return Promise.resolve(error);
  } else if (error instanceof Error) {
    const maxErrorLength = 4096;
    return StackTrace.fromError(error)
      .then((stackframes) =>
        [
          sanitizeErrorMessage(error.message),
          ">>>>>>>>>> Stringification >>>>>>>>>>",
          JSON.stringify(error),
          ">>>>>>>>>> Stack >>>>>>>>>>",
          ...stackframes.map((sf) => sf.toString()),
        ]
          .join("\n")
          .substring(0, maxErrorLength)
      )
      .catch((e) => {
        console.error(e);
        return unknownError;
      });
  } else {
    const parsedJsonRpcError = jsonRpcError.safeParse(error);
    const parsedMessageKeyError = messageKeyErrorParser.safeParse(error);
    if (parsedJsonRpcError.success) {
      return Promise.resolve(
        `${parsedJsonRpcError.data.message} (code ${parsedJsonRpcError.data.code}): ${parsedJsonRpcError.data.data.message} (code ${parsedJsonRpcError.data.data.code})`
      );
    } else if (parsedMessageKeyError.success) {
      return Promise.resolve(parsedMessageKeyError.data.message);
    } else {
      return unknownError;
    }
  }
}

const MAX_FRIENDLY_MESSAGE_LENGTH = 120;

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again";
const INVALID_DATA_MESSAGE = "Received unexpected data. Please try again later";
const SERVICE_UNAVAILABLE_MESSAGE = "The bridge service is unavailable right now. Please try again later";
const INVALID_INPUT_MESSAGE = "Invalid transaction details. Please review the values and try again";

const errorCodeMessages: Record<string, string> = {
  "-32002": "A request is already pending in your wallet. Please open your wallet to continue",
  "4001": "The request was rejected in your wallet",
  "4100": "Your wallet has not authorized this request",
  "4902": "This network has not been added to your wallet yet",
  ACTION_REJECTED: "The request was rejected in your wallet",
  CALL_EXCEPTION: "The transaction was reverted by the contract",
  INSUFFICIENT_FUNDS: "Insufficient funds",
  INVALID_ARGUMENT: INVALID_INPUT_MESSAGE,
  MISSING_ARGUMENT: INVALID_INPUT_MESSAGE,
  NETWORK_ERROR: "Network error. Please check your connection and try again",
  NONCE_EXPIRED: "This transaction nonce was already used. Please try again",
  NUMERIC_FAULT: INVALID_INPUT_MESSAGE,
  REPLACEMENT_UNDERPRICED:
    "Another pending transaction has a higher fee. Wait for it to confirm or speed it up in your wallet",
  SERVER_ERROR: "The network returned an error. Please try again later",
  TIMEOUT: "The request timed out. Please try again",
  TRANSACTION_REPLACED: "The transaction was replaced by another transaction in your wallet",
  UNEXPECTED_ARGUMENT: INVALID_INPUT_MESSAGE,
  UNPREDICTABLE_GAS_LIMIT: "The transaction is likely to fail, so the gas fee could not be estimated",
  UNSUPPORTED_OPERATION: "This action is not supported by your wallet or network",
};

const messagePatterns: { message: string; pattern: RegExp }[] = [
  { message: errorCodeMessages.INSUFFICIENT_FUNDS, pattern: /insufficient funds/i },
  { message: errorCodeMessages.ACTION_REJECTED, pattern: /user (rejected|denied)/i },
  { message: errorCodeMessages.NONCE_EXPIRED, pattern: /nonce (too low|has already been used)/i },
  { message: errorCodeMessages.REPLACEMENT_UNDERPRICED, pattern: /replacement.*underpriced/i },
  { message: errorCodeMessages.NETWORK_ERROR, pattern: /failed to fetch|network error|networkerror/i },
  { message: errorCodeMessages.TIMEOUT, pattern: /timed? ?out/i },
];

const genericWrapperMessages = /^(internal json-rpc error\.?|internal error\.?|unknown error\.?)$/i;

const technicalTextPattern =
  /[{}[\]<>]|0x[0-9a-f]{8,}|\b\w+=|\bat \S+:\d+|https?:\/\/|chrome-extension:|\bundefined\b|\bnull\b/i;

function getProperty(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null || !(key in value)) {
    return undefined;
  }
  return Reflect.get(value, key);
}

function collectErrorMessages(error: unknown, depth = 0): string[] {
  if (depth > 4 || error === undefined || error === null) {
    return [];
  }
  if (typeof error === "string") {
    return [error];
  }
  const ownMessages = ["reason", "message"]
    .map((key) => getProperty(error, key))
    .filter((value): value is string => typeof value === "string");
  const nestedMessages = ["error", "data", "cause"].flatMap((key) =>
    collectErrorMessages(getProperty(error, key), depth + 1)
  );
  return [...ownMessages, ...nestedMessages];
}

function extractRevertReason(messages: string[]): string | undefined {
  for (const message of messages) {
    const match = /execution reverted:?\s*([^"\n(]*)/i.exec(message);
    if (match) {
      const reason = match[1].trim();
      return reason ? `The transaction was reverted: ${reason}` : undefined;
    }
  }
  return undefined;
}

function cleanErrorMessage(message: string): string {
  const firstLine = message.split("\n")[0];
  const withoutEthersDetails = firstLine.split(/ \[ See: | \(\w+=|, method=/)[0];
  const withoutRpcPrefix = withoutEthersDetails.replace(/^RPC 0x[0-9a-f]+ \w+ \w+: /i, "");
  const trimmed = withoutRpcPrefix.trim();
  if (
    !trimmed ||
    trimmed.length > MAX_FRIENDLY_MESSAGE_LENGTH ||
    technicalTextPattern.test(trimmed)
  ) {
    return GENERIC_ERROR_MESSAGE;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Returns a short, human readable message for an error, intended to be displayed in the UI.
 * The full technical details should be obtained with `parseError` instead.
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return INVALID_DATA_MESSAGE;
  }

  const messages = collectErrorMessages(error);
  const code = getProperty(error, "code");

  if (getProperty(error, "isAxiosError") === true) {
    return messages.some((message) => /network error|timeout/i.test(message))
      ? errorCodeMessages.NETWORK_ERROR
      : SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (code === "CALL_EXCEPTION" || code === "UNPREDICTABLE_GAS_LIMIT") {
    const revertReason = extractRevertReason(messages);
    if (revertReason) {
      return revertReason;
    }
  }

  if ((typeof code === "string" || typeof code === "number") && errorCodeMessages[String(code)]) {
    return errorCodeMessages[String(code)];
  }

  const matchedPattern = messagePatterns.find(({ pattern }) =>
    messages.some((message) => pattern.test(message))
  );
  if (matchedPattern) {
    return matchedPattern.message;
  }

  const revertReason = extractRevertReason(messages);
  if (revertReason) {
    return revertReason;
  }

  const meaningfulMessage = messages.find(
    (message) => message.trim().length > 0 && !genericWrapperMessages.test(message.trim())
  );
  return meaningfulMessage ? cleanErrorMessage(meaningfulMessage) : GENERIC_ERROR_MESSAGE;
}

export function logDecodingError<T>(error: ZodError<T>, details: string): void {
  error.errors.forEach((issue) => {
    switch (issue.code) {
      case "invalid_union": {
        issue.unionErrors.forEach((e) => logDecodingError(e, details));
        break;
      }
      default: {
        console.error(`A decoding error occurred: ${details}`);
        console.error(JSON.stringify(issue, null, 4));
        break;
      }
    }
  });
}

/**
 * Report an error using the report issue form
 */
export function reportError(error: string, reportForm: ReportFormEnvEnabled): void {
  // ToDo: Add network data
  const data = {
    [reportForm.entries.url]: window.location.href,
    [reportForm.entries.error]: error,
    [reportForm.entries.platform]: platform.toString(),
  };
  const params = new URLSearchParams(data).toString();
  window.open(`${reportForm.url}?${params}`, "_blank");
}
