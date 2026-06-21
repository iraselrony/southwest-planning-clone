import type { Access } from "payload";

/**
 * Public read — any request may read the collection. Used for `pages`,
 * `services`, `siteSettings`, and `media` (read-only public access so the
 * frontend Local API can render pages without auth).
 */
export const publicRead: Access = () => true;

/**
 * Public create — any request may create a row. Used only on
 * `contactSubmissions` so the public `/api/contact` endpoint can insert
 * without auth.
 */
export const publicCreate: Access = () => true;

/**
 * Admin-only access. Returns true if the requesting user is signed in.
 * Used for update/delete on content collections, and read/update on
 * `contactSubmissions` (so submissions are not publicly listable).
 */
export const isAdmin: Access = ({ req: { user } }) => Boolean(user);

/**
 * Admin-only read — used for `contactSubmissions` and the `users`
 * collection.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (user) return true;
  return false;
};
