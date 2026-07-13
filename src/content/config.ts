import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      language: z.enum(["pl", "en"]).default("pl"),
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      heroImage: z.string().optional(),
    }),
});

export const collections = { blog };
