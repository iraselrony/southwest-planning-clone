/**
 * Cached Payload client. The first call boots the Payload instance; every
 * subsequent call in the same process reuses the cached handle.
 *
 * Server-only by convention. This module is imported only from:
 *   - React Server Components (Next.js page files)
 *   - API route handlers
 *   - Payload seed/migration scripts (via `payload run`)
 * The Payload Local API is not safe to call from client components.
 */
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

let cached: Promise<Payload> | null = null;

export async function getPayloadClient(): Promise<Payload> {
	if (cached) return cached;
	cached = getPayload({ config });
	return cached;
}
