import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      title: z.string(),
      seoTitle: z.string().optional(),
      description: z.string(),
      date: z.date(),
      language: z.enum(["pl", "en"]).default("pl"),
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      // Broad grouping behind the blog index filter chips. Optional: posts
      // without one fall back to a tag lookup in src/utils/blog.ts.
      category: z.enum(['implementation', 'strategy', 'tools', 'practice']).optional(),
      heroImage: z.string().optional(),
    }),
});

export const collections = { blog };
