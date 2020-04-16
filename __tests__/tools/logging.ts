const noop = (): undefined => undefined;

export const mockLogger = {
  info: noop,
  fatal: noop,
  warn: noop,
  error: noop,
  debug: noop,
  trace: noop,
  child: noop,
};
