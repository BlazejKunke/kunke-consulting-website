import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  // Astro 6 removed the legacy `type: "content"` collections along with the
  // implicit src/content/blog lookup, so the directory is now named explicitly.
  // The entry `id` this produces is the filename without its extension — the
  // same value the old `slug` held — which is what keeps /blog/<slug>/ stable.
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
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
