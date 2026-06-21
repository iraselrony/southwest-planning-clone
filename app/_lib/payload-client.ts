/**
 * Cached Payload client. The first call boots the Payload instance; every
 * subsequent call in the same process reuses the cached handle.
 *
 * This module is server-only; never import it into a client component.
 */
import "server-only";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

let cached: Promise<Payload> | null = null;

export async function getPayloadClient(): Promise<Payload> {
	if (cached) return cached;
	cached = getPayload({ config });
	return cached;
}
