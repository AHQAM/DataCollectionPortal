import {
  onCall,
  CallableOptions,
  HttpsError,
} from "firebase-functions/v2/https";
import { verifyAppCheck } from "./appCheck";

export { HttpsError };

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
  const defaultOptions: CallableOptions = {
    cors: true,
    maxInstances: 100, // Prevent DDoS billing spikes
    memory: "256MiB",
    concurrency: 80, // Minimize cold starts
  };

  const options: CallableOptions =
    typeof optionsOrHandler === "function"
      ? defaultOptions
      : { ...defaultOptions, ...optionsOrHandler };
  const handler =
    typeof optionsOrHandler === "function"
      ? optionsOrHandler
      : handlerOrUndefined!;

  return onCall(options, async (req: any, ctx?: any) => {
    // 1. Direct invocation from test runners passing (data, context)
    if (ctx && ctx.auth !== undefined) {
      verifyAppCheck(ctx);
      return handler(req, ctx);
    }
    // 2. Runtime invocation via Firebase / Cloud Run passing single CallableRequest
    if (
      req &&
      (req.data !== undefined ||
        req.auth !== undefined ||
        req.rawRequest !== undefined)
    ) {
      const context: CallableContextCompat = {
        auth: req.auth,
        app: req.app,
        rawRequest: req.rawRequest,
      };
      verifyAppCheck(context);
      return handler(req.data, context);
    }
    // 3. Fallback
    const fallbackContext = ctx || {};
    verifyAppCheck(fallbackContext);
    return handler(req, fallbackContext);
  });
}
