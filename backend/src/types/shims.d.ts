// Shims for modules without types installed. Prefer installing @types/* packages.

declare module 'morgan' {
  import { RequestHandler } from 'express';
  const morgan: (...args: any[]) => RequestHandler;
  export = morgan;
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: string): RequestHandler;
  namespace cookieParser {}
  export = cookieParser;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secretOrPrivateKey: string, options?: any): string;
  export function verify(token: string, secretOrPublicKey: string, options?: any): any;
  export function decode(token: string, options?: any): any;
}
