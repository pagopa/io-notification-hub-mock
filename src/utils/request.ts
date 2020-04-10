import { Request } from "express";

/**
 * Returns a pretty representation of the data included in a request, that is body, headers, params and query string
 * @param req
 */
export function getRequestInfo(req: Request): string {
  return JSON.stringify(
    {
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query
    },
    null,
    2
  );
}
