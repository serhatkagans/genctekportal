import postsData from "@/lib/generated/wordpress-posts.json";
import pagesData from "@/lib/generated/wordpress-pages.json";
import categoriesData from "@/lib/generated/wordpress-categories.json";

export type WordPressContent = {
  id: number;
  type: "post" | "page";
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  date: string;
  modified: string;
  link: string;
  parent: number;
  menuOrder: number;
  categories: number[];
  featuredImage: string;
  html: string;
};

export type WordPressCategory = { id: number; slug: string; name: string; description: string; count: number };

export const wordpressPosts = postsData as WordPressContent[];
export const wordpressPages = pagesData as WordPressContent[];
export const wordpressCategories = categoriesData as WordPressCategory[];
export const wordpressContent = [...wordpressPages, ...wordpressPosts];

export function getWordPressPost(slug: string) {
  return wordpressPosts.find((item) => item.slug === slug);
}

export function getWordPressPage(slug: string) {
  return wordpressPages.find((item) => item.slug === slug);
}

export function getWordPressContentByPath(contentPath: string) {
  const normalized = decodeURIComponent(contentPath).replace(/^\/+|\/+$/g, "");
  return wordpressContent.find((item) => item.path === normalized);
}

export function categoryName(ids: number[]) {
  return wordpressCategories.find((category) => ids.includes(category.id))?.name || "Haber";
}
