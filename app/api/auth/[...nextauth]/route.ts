/**
 * Auth.js v5 route handler. Catches all sub-routes under /api/auth/*:
 *   - /api/auth/signin/email      (POST: request magic link)
 *   - /api/auth/callback/email   (GET: click the magic link)
 *   - /api/auth/signout           (POST: end session)
 *   - /api/auth/session           (GET: current session JSON)
 *   - /api/auth/csrf              (GET: CSRF token)
 *   - /api/auth/providers         (GET: configured providers)
 */
import { handlers } from "../../../../auth";

export const { GET, POST } = handlers;
