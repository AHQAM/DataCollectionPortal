import {
  onCall,
  CallableOptions,
  CallableRequest,
  HttpsError as Gen2HttpsError,
} from "firebase-functions/v2/https";
import { verifyAppCheck } from "./appCheck";

export const HttpsError = Gen2HttpsError;

export interface CallableContextCompat {
  auth?: {
    uid: string;
    token: Record<string, any>;
  } | null;
  app?: any;
  rawRequest?: any;
}

/**
 * Creates a Cloud Functions Gen 2 callable function with universal compatibility
 * for both runtime (Cloud Run CallableRequest) and test harnesses (firebase-functions-test).
 */
export function onCallGen2<TData = any, TResp = any>(
  optionsOrHandler:
    | CallableOptions
    | ((data: TData, context: CallableContextCompat) => Promise<TResp> | TResp),
  handlerOrUndefined?: (
    data: TData,
    context: CallableContextCompat,
  ) => Promise<TResp> | TResp,
) {
  let options: CallableOptions = { memory: "256MiB", timeoutSeconds: 60 };
  let handler: (
    data: TData,
    context: CallableContextCompat,
  ) => Promise<TResp> | TResp;

  if (typeof optionsOrHandler === "function") {
    handler = optionsOrHandler;
  } else {
    options = { ...options, ...optionsOrHandler };
    handler = handlerOrUndefined!;
  }

  const func: any = onCall(
    options,
    async (requestOrData: any, maybeContext?: any) => {
      let callData: any;
      let context: CallableContextCompat;

      if (maybeContext !== undefined) {
        // Invoked via testEnv.wrap(fn)(data, context)
        callData = requestOrData;
        context = {
          auth: maybeContext?.auth ?? null,
          app: maybeContext?.app,
          rawRequest: maybeContext?.rawRequest,
        };
      } else if (
        requestOrData &&
        typeof requestOrData === "object" &&
        ("data" in requestOrData || "auth" in requestOrData)
      ) {
        // Standard Gen 2 runtime: requestOrData is CallableRequest
        callData = requestOrData.data;
        context = {
          auth: requestOrData.auth ?? null,
          app: requestOrData.app,
          rawRequest: requestOrData.rawRequest,
        };
      } else {
        callData = requestOrData;
        context = { auth: null };
      }

      verifyAppCheck(context);
      return handler(callData, context);
    },
  );

  return func;
}
