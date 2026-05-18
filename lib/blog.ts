export type BlogAuthor = {
  name: string;
  role: string;
  profileUrl: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  category: "Productivity" | "Technology" | "Security" | "Tutorials";
  datePublished: string;
  dateModified: string;
  readTime: string;
  imageEmoji: string;
  toolLinks: Array<{ label: string; href: `/tools/${string}` }>;
  content: Array<{ heading: string; paragraphs: string[] }>;
};

export const BLOG_AUTHOR: BlogAuthor = {
  name: "EaseMyTools Editorial Team",
  role: "Productivity & web tools specialists",
  profileUrl: "https://easemytools.com/about",
};

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "boost-productivity-with-online-tools",
    title: "10 Ways to Boost Your Productivity with Online Tools",
    description: "Practical habits and tool workflows to reduce busywork and get more done without adding complexity.",
    excerpt: "Discover how to streamline your workflow and save time with these essential productivity tips and tools.",
    category: "Productivity",
    datePublished: "2024-01-15",
    dateModified: "2024-01-15",
    readTime: "5 min read",
    imageEmoji: "📊",
    toolLinks: [
      { label: "Word Counter", href: "/tools/word-counter" },
      { label: "Case Converter", href: "/tools/case-converter" },
    ],
    content: [
      { heading: "Use focused tool chains", paragraphs: ["Instead of jumping between tabs, define a repeatable sequence of tools for each task type. For example, writers can move from drafting to cleanup to final checks using a small, consistent stack."] },
      { heading: "Batch repetitive edits", paragraphs: ["Group similar tasks and complete them in one pass. Batch workflows reduce context switching and improve consistency across files."] },
      { heading: "Measure and refine", paragraphs: ["Track how long recurring tasks take. If a step keeps slowing you down, automate it or replace it with a faster tool flow."] },
    ],
  },
  {
    id: 2,
    slug: "future-of-browser-based-image-processing",
    title: "The Future of Browser-Based Image Processing",
    description: "How modern browser APIs and local-first workflows are changing everyday image editing.",
    excerpt: "Explore how modern web technologies are revolutionizing image editing and processing directly in your browser.",
    category: "Technology",
    datePublished: "2024-01-10",
    dateModified: "2024-01-10",
    readTime: "7 min read",
    imageEmoji: "🖼️",
    toolLinks: [
      { label: "Image Compressor", href: "/tools/image-compressor" },
      { label: "Image Resizer", href: "/tools/image-resizer" },
    ],
    content: [
      { heading: "Performance is no longer a blocker", paragraphs: ["With WebAssembly and modern rendering pipelines, browsers can now handle many editing tasks that once required desktop software."] },
      { heading: "Privacy improves by default", paragraphs: ["Local processing means sensitive files do not need to leave your device for common operations like resize, compression, and format conversion."] },
      { heading: "Expect smarter workflows", paragraphs: ["As browser capabilities expand, tools will offer richer presets and contextual guidance while keeping interfaces simple."] },
    ],
  },
  {
    id: 3,
    slug: "privacy-first-why-local-processing-matters",
    title: "Privacy-First: Why Local Processing Matters",
    description: "Why keeping file operations in the browser can reduce risk and improve trust for users and teams.",
    excerpt: "Learn why processing files locally in your browser is crucial for data privacy and security in the digital age.",
    category: "Security",
    datePublished: "2024-01-05",
    dateModified: "2024-01-05",
    readTime: "4 min read",
    imageEmoji: "🔒",
    toolLinks: [
      { label: "JWT Debugger", href: "/tools/jwt-debugger" },
      { label: "Hash Generator", href: "/tools/hash-generator" },
    ],
    content: [
      { heading: "Reduce third-party exposure", paragraphs: ["Every upload to an external server introduces a dependency and a potential risk surface. Local-first tools remove that extra transfer for many tasks."] },
      { heading: "Build user trust", paragraphs: ["Users are more likely to adopt tools that clearly explain what data is processed, where it is processed, and what is stored."] },
      { heading: "Security and speed can align", paragraphs: ["Local operations often feel faster because you skip upload latency and avoid queue delays on remote services."] },
    ],
  },
];

export const getBlogPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);

export const getRelatedPosts = (slug: string, category: BlogPost["category"]): BlogPost[] =>
  blogPosts.filter((post) => post.slug !== slug && post.category === category);
