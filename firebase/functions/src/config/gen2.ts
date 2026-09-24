import { onCall, CallableOptions, HttpsError } from "firebase-functions/v2/https";

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
  const options: CallableOptions =
    typeof optionsOrHandler === "function" ? { cors: true } : optionsOrHandler;
  const handler =
    typeof optionsOrHandler === "function"
      ? optionsOrHandler
      : handlerOrUndefined!;

  return onCall(options, async (req: any, ctx?: any) => {
    // 1. Direct invocation from test runners passing (data, context)
    if (ctx && ctx.auth !== undefined) {
      return handler(req, ctx);
    }
    // 2. Runtime invocation via Firebase / Cloud Run passing single CallableRequest
    if (
      req &&
      (req.data !== undefined ||
        req.auth !== undefined ||
        req.rawRequest !== undefined)
    ) {
      return handler(req.data, {
        auth: req.auth,
        app: req.app,
        rawRequest: req.rawRequest,
      });
    }
    // 3. Fallback
    return handler(req, ctx || {});
  });
}
