/**
 * Gabimet e serverit me status HTTP dhe mesazh shqip (typed server errors).
 * Kept in a dependency-free module so env, db, session and http helpers can all throw and catch
 * them without import cycles. `handleRoute` maps every HttpError to its status and Albanian message.
 */

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    public readonly messageSq: string,
    public readonly details?: unknown,
  ) {
    super(messageSq);
    this.name = 'HttpError';
  }
}

/** Missing or invalid server configuration (e.g. DATABASE_URL in production). Never contains values. */
export class ConfigError extends HttpError {
  constructor(messageSq: string, details?: unknown) {
    super(503, 'konfigurim_mungon', messageSq, details);
    this.name = 'ConfigError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(messageSq = 'Duhet të hyni në llogari (ose të nisni si vizitor) për të vazhduar.') {
    super(401, 'pa_autorizim', messageSq);
    this.name = 'UnauthorizedError';
  }
}

export class EmailTakenError extends HttpError {
  constructor() {
    super(409, 'email_i_zene', 'Ky email është regjistruar tashmë. Provoni të hyni në llogari.');
    this.name = 'EmailTakenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(messageSq = 'Nuk u gjet.') {
    super(404, 'nuk_u_gjet', messageSq);
    this.name = 'NotFoundError';
  }
}
