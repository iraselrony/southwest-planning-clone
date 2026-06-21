import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/**
 * Payload built-in `users` collection. Single admin user for v1.
 * Public registration is disabled; only the first-run setup wizard (or a
 * CLI `payload createUser`) can create a user.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "createdAt"],
    description: "Single admin user. Login at /admin.",
  },
  access: {
    create: () => false, // disable public registration
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: false,
    },
  ],
  timestamps: true,
};
