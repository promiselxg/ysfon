export function withMiddleware(...middlewares) {
  return async (req, handler) => {
    for (const middleware of middlewares) {
      const result = await middleware(req);
      if (result) return result;
    }
    return handler(req);
  };
}
