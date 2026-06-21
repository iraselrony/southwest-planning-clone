import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";
import { publicRead, isAdmin } from "../access";
import {
  HeroBlock,
  RichTextBlock,
  ImageAndTextBlock,
  CtaBlock,
  ServiceCardsBlock,
} from "../blocks";

/**
 * Revalidate ISR cache when a page is created/updated/deleted so the public
 * site picks up the new content within one request, not 60s.
 */
const revalidatePage: CollectionAfterChangeHook = ({ doc }) => {
  if (doc?.slug) {
    try {
      revalidateTag(`page:${doc.slug}`);
    } catch {
      // revalidateTag is only available in a request context; safe to ignore
      // during build/seed scripts.
    }
  }
  return doc;
};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["slug", "title", "updatedAt"],
    description: "One row per public route. 18 rows seeded.",
  },
  access: {
    read: publicRead,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [revalidatePage],
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description: "URL path. e.g. /, /contact, /services/housing",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "H1 on the page. Displayed in the admin list.",
      },
    },
    {
      name: "metaTitle",
      type: "text",
      required: true,
    },
    {
      name: "metaDescription",
      type: "textarea",
      required: true,
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "showInNav",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "body",
      type: "array",
      labels: {
        singular: "Zone",
        plural: "Zones",
      },
      admin: {
        description:
          "Editable zones on the page. Each block is injected into a marked <div data-payload-zone='<zone-id>'> in the page HTML.",
      },
      fields: [
        {
          name: "zoneId",
          type: "text",
          required: true,
          admin: {
            description:
              "Stable zone id matching data-payload-zone='<zone-id>' in the mirrored HTML. e.g. home-hero, about, service-cards, contact-cta",
          },
        },
        {
          name: "block",
          type: "blocks",
          blocks: [HeroBlock, RichTextBlock, ImageAndTextBlock, CtaBlock, ServiceCardsBlock],
          required: true,
        },
      ],
    },
  ],
  timestamps: true,
};
