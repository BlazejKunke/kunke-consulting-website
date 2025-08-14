import { defineCollection, z } from "astro:content";

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  tags: z.array(z.string()).optional(),
  heroImage: z.string().optional(),
});

const blogPlCollection = defineCollection({
  type: "content",
  schema: blogSchema,
});

const blogEnCollection = defineCollection({
  type: "content",
  schema: blogSchema,
});

export const collections = {
  'pl/blog': blogPlCollection,
  'en/blog': blogEnCollection,
};
