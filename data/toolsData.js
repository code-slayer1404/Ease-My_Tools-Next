import {
  FaQrcode,
  FaFileCode,
  FaExchangeAlt,
  FaPalette,
  FaImage,
  FaFile,
  FaCalculator,
  FaGlobe,
  FaTextHeight,
  FaBeer,
  FaHeartbeat,
  FaFileCsv,
  FaCompress,
  FaUserCircle,
  FaVideo,
} from "react-icons/fa";
import {
  MdFormatColorText,
  MdOutlineImage,
  MdOutlineCurrencyExchange,
  MdAutoFixHigh,
  MdOutlineDriveFileRenameOutline,
} from "react-icons/md";
import { BiCodeAlt, BiText } from "react-icons/bi";
import { AiOutlineFileText } from "react-icons/ai";
import {
  TbBinaryTree,
  TbFavicon,
  TbVectorBezier,
  TbVectorTriangle,
} from "react-icons/tb";
import { BsFiletypeSvg, BsRegex } from "react-icons/bs";
import { VscFilePdf } from "react-icons/vsc";

export const toolsByCategory = {
  image: [
    {
      name: "Image Resizer",
      slug: "image-resizer",
      icon: MdOutlineImage,
      component: () => import("@/components/tools/image-resizer"),
      seo: {
        title: "Image Resizer | Resize Images for Web and Social",
        description: "Resize JPG, PNG, WebP, and AVIF images quickly for websites, social media, and documents.",
      },
      seoContent: {
        h1: "Image Resizer",
        intro: "Resize images to exact dimensions in seconds while keeping visual quality suitable for web and sharing.",
        howToUse: ["Upload an image.", "Set width and height or choose a preset.", "Apply resize and download the result."],
        features: ["Custom width and height controls", "Common social and web presets", "Supports popular image formats"],
        benefits: ["Faster page load times", "Consistent media dimensions", "Better fit across platforms"],
        useCases: ["Blog and landing page assets", "Marketplace product photos", "Social media post images"],
        faqs: [
          { question: "Will resizing reduce image quality?", answer: "Resizing can affect detail, but the tool is optimized to keep results clear for normal web use." },
          { question: "Can I resize for specific platforms?", answer: "Yes, you can enter exact dimensions to match any platform requirement." },
        ],
        relatedTools: [{ slug: "image-compressor", name: "Image Compressor" }, { slug: "remove-background", name: "Remove Background" }, { slug: "profile-pic-optimizer", name: "Profile Picture Optimizer" }],
      },
    },
    {
      name: "Image Compressor",
      slug: "image-compressor",
      icon: FaCompress,
      component: () => import("@/components/tools/image-compressor"),
      seo: {
        title: "Image Compressor | Compress Images to Exact Size",
        description:
          "Compress JPEG, PNG, WebP, and AVIF images to exact file sizes while preserving quality. Perfect for web optimization.",
        keywords:
          "image compressor, compress image, reduce image size, image optimizer, webp converter",
      },
      seoContent: {
        h1: "Image Compressor",
        intro: "Compress image files to smaller sizes while keeping useful visual quality for websites, email, and sharing.",
        howToUse: ["Upload an image file.", "Choose target size, format, and mode.", "Compress and download the optimized result."],
        features: ["Target file size control", "JPEG, PNG, WebP, and AVIF options", "Compression modes for quality vs size"],
        benefits: ["Faster upload and download speed", "Lower storage usage", "Improved web performance"],
        useCases: ["Website image optimization", "Email attachment limits", "Content publishing workflows"],
        faqs: [
          { question: "Which format gives the smallest files?", answer: "WebP and AVIF typically produce smaller files than older formats for many images." },
          { question: "Can I keep metadata?", answer: "Yes, you can choose whether metadata is preserved when compressing." },
        ],
        relatedTools: [{ slug: "image-resizer", name: "Image Resizer" }, { slug: "remove-background", name: "Remove Background" }, { slug: "file-converter", name: "File Converter" }],
      },
    },
        {
      name: "Profile Picture Optimizer",
      slug: "profile-pic-optimizer",
      icon: FaUserCircle,
      component: () => import("@/components/tools/profile-pic-optimizer"),
      seo: {
        title: "Profile Picture Optimizer | Perfect Size for Social Media",
        description: "Create perfectly sized profile pictures for WhatsApp, Instagram, Facebook, Twitter, Snapchat, and LinkedIn with smart face detection and auto-cropping.",
        keywords: "profile picture optimizer, social media photo, image resizer for social media, profile photo editor, facebook profile picture, instagram profile photo",
      },
    },
    {
      name: "Video Thumbnail Generator",
      slug: "video-thumbnail-generator",
      icon: FaVideo,
      component: () => import("@/components/tools/video-thumbnail-generator"),
      seo: {
        title: "Video Thumbnail Generator | Extract Thumbnails from Videos",
        description: "Extract high-quality thumbnails from any video. Perfect for YouTube, social media, and content creation. Supports MP4, WebM, and more.",
        keywords: "video thumbnail generator, extract thumbnails, youtube thumbnail, video to thumbnail, thumbnail maker",
      },
    },
    {
      name: "Color Picker",
      slug: "color-picker",
      icon: FaPalette,
      component: () => import("@/components/tools/color-picker"),
      seo: {
        title: "Color Picker",
        description: "Use the Color Picker tool on EaseMyTools.",
      },
    },
    {
      name: "SvgConverter",
      slug: "svg-converter",
      icon: BsFiletypeSvg,
      component: () => import("@/components/tools/svg-converter"),
      seo: {
        title: "Svg Converter",
        description: "Use the SVG Converter tool on EaseMyTools.",
      },
    },
    {
      name: "ImageToSvg",
      slug: "image-to-svg",
      icon: TbVectorTriangle,
      component: () => import("@/components/tools/image-to-svg"),
      seo: {
        title: "Image to SVG",
        description: "Convert raster images into SVG format instantly.",
      },
    },
    {
      name: "RemoveBackground",
      slug: "remove-background",
      icon: MdAutoFixHigh,
      component: () => import("@/components/tools/remove-background"),
      seo: {
        title: "Remove Background | Remove Photo Backgrounds Online",
        description: "Remove image backgrounds and export clean transparent cutouts for products, profiles, and designs.",
      },
      seoContent: {
        h1: "Remove Background",
        intro: "Remove distracting backgrounds from photos and keep focus on your subject with a simple upload workflow.",
        howToUse: ["Upload an image.", "Run cutout or choose a background mode.", "Download your processed image."],
        features: ["Automatic subject cutout", "Transparent, solid color, and photo backgrounds", "Extra effects and basic adjustments"],
        benefits: ["Cleaner product and profile visuals", "Faster image editing workflow", "No heavy desktop editor required"],
        useCases: ["Ecommerce product listings", "Profile photos and team pages", "Quick creative mockups"],
        faqs: [
          { question: "Which file types work best?", answer: "Clear JPG or PNG images with a visible subject generally produce the best cutout results." },
          { question: "Can I keep a transparent background?", answer: "Yes, choose the transparent option before downloading." },
        ],
        relatedTools: [{ slug: "image-resizer", name: "Image Resizer" }, { slug: "image-compressor", name: "Image Compressor" }, { slug: "profile-pic-optimizer", name: "Profile Picture Optimizer" }],
      },
    },
    {
      name: "Mp4ToGif",
      slug: "mp4-to-gif",
      icon: FaBeer,
      component: () => import("@/components/tools/mp4-to-gif"),
      seo: {
        title: "MP4 to GIF",
        description: "Convert MP4 videos to optimized GIFs online.",
      },
    },
  ],
  converters: [
    {
      name: "Unit Converter",
      slug: "unit-converter",
      icon: FaExchangeAlt,
      component: () => import("@/components/tools/unit-converter"),
      seo: {
        title: "Unit Converter",
        description: "Convert units quickly and accurately.",
      },
    },
    {
      name: "Case Converter",
      slug: "case-converter",
      icon: MdFormatColorText,
      component: () => import("@/components/tools/case-converter"),
      seo: {
        title: "Case Converter",
        description: "Convert text casing instantly.",
      },
    },
    {
      name: "Currency Converter",
      slug: "currency-converter",
      icon: MdOutlineCurrencyExchange,
      component: () => import("@/components/tools/currency-converter"),
      seo: {
        title: "Currency Converter",
        description: "Convert currencies with up-to-date exchange rates.",
      },
    },
    {
      name: "Base64 Converter",
      slug: "base64-converter",
      icon: TbBinaryTree,
      component: () => import("@/components/tools/base64-converter"),
      seo: {
        title: "Base64 Converter",
        description: "Encode and decode Base64 data online.",
      },
    },
  ],
  text: [
    {
      name: "Word Counter",
      slug: "word-counter",
      icon: AiOutlineFileText,
      component: () => import("@/components/tools/word-counter"),
      seo: {
        title: "Word Counter",
        description: "Count words and characters in real time.",
      },
    },
    {
      name: "JSON Formatter",
      slug: "json-formatter",
      icon: FaFileCode,
      component: () => import("@/components/tools/json-formatter"),
      seo: {
        title: "JSON Formatter",
        description: "Format and validate JSON instantly.",
      },
    },
    {
      name: "Markdown Previewer",
      slug: "markdown-previewer",
      icon: BiCodeAlt,
      component: () => import("@/components/tools/markdown-previewer"),
      seo: {
        title: "Markdown Previewer",
        description: "Preview rendered markdown as you type.",
      },
    },
    {
      name: "Text Diff Checker",
      slug: "text-diff-checker",
      icon: BiText,
      component: () => import("@/components/tools/text-diff-checker"),
      seo: {
        title: "Text Diff Checker",
        description: "Compare text and highlight differences.",
      },
    },
    {
      name: "PDFImageExtractor",
      slug: "pdf-image-extractor",
      icon: VscFilePdf,
      component: () => import("@/components/tools/pdf-image-extractor"),
      seo: {
        title: "PDF Image Extractor | Extract Images from PDF Files",
        description: "Extract embedded images from PDF files quickly for reuse in presentations, documents, and design tasks.",
      },
      seoContent: {
        h1: "PDF Image Extractor",
        intro: "Pull images out of PDF documents without manually taking screenshots page by page.",
        howToUse: ["Upload your PDF file.", "Run extraction to detect embedded images.", "Download selected images."],
        features: ["Extracts images from uploaded PDF files", "Simple upload and export flow", "Useful for document asset reuse"],
        benefits: ["Saves manual capture time", "Keeps extracted visuals reusable", "Reduces repetitive editing work"],
        useCases: ["Reusing report graphics", "Preparing training documents", "Collecting assets from PDF brochures"],
        faqs: [
          { question: "Does it extract every visible graphic?", answer: "It extracts embedded images. Some vector-only content may need separate handling." },
          { question: "Is my upload stored permanently?", answer: "The page is designed for quick processing workflows rather than long-term storage." },
        ],
        relatedTools: [{ slug: "file-converter", name: "File Converter" }, { slug: "image-compressor", name: "Image Compressor" }, { slug: "image-resizer", name: "Image Resizer" }],
      },
    },
  ],
  calculators: [
    {
      name: "Percentage Calculator",
      slug: "percentage-calculator",
      icon: FaCalculator,
      component: () => import("@/components/tools/percentage-calculator"),
      seo: {
        title: "Percentage Calculator",
        description: "Calculate percentages quickly and accurately.",
      },
    },
    {
      name: "Age Calculator",
      slug: "age-calculator",
      icon: FaCalculator,
      component: () => import("@/components/tools/age-calculator"),
      seo: {
        title: "Free Age Calculator Online (Instant & Accurate)",
        description: "Calculate your exact age instantly.",
      },
    },
    {
      name: "Time Calculator",
      slug: "time-calculator",
      icon: FaCalculator,
      component: () => import("@/components/tools/time-calculator"),
      seo: {
        title: "Time Calculator",
        description: "Add, subtract, and convert time values.",
      },
    },
  ],
  file: [
    {
      name: "CSV to JSON",
      slug: "csv-to-json",
      icon: FaFile,
      component: () => import("@/components/tools/csv-to-json"),
      seo: {
        title: "CSV to JSON",
        description: "Convert CSV files into JSON format instantly.",
      },
    },
    {
      name: "XML Formatter",
      slug: "xml-formatter",
      icon: FaFileCode,
      component: () => import("@/components/tools/xml-formatter"),
      seo: {
        title: "XML Formatter",
        description: "Format and beautify XML content online.",
      },
    },
    {
      name: "File Rename Tool",
      slug: "file-rename-tool",
      icon: MdOutlineDriveFileRenameOutline,
      component: () => import("@/components/tools/file-rename-tool"),
      seo: {
        title: "File Rename Tool",
        description: "Batch rename files with flexible patterns.",
      },
    },
    {
      name: "File Converter",
      slug: "file-converter",
      icon: FaFileCsv,
      component: () => import("@/components/tools/file-converter"),
      seo: {
        title: "File Converter | Convert Files Between Formats",
        description: "Convert files between supported formats quickly for sharing, compatibility, and workflow convenience.",
      },
      seoContent: {
        h1: "File Converter",
        intro: "Convert files into compatible formats so they are easier to share, upload, and use across tools.",
        howToUse: ["Upload your source file.", "Choose the target format.", "Run conversion and download."],
        features: ["Straightforward format selection", "Quick file processing flow", "Browser-based usage with no install"],
        benefits: ["Better compatibility across platforms", "Faster file preparation", "Simpler collaboration and sharing"],
        useCases: ["Preparing files for clients", "Converting documents for tools that require specific formats", "Normalizing assets before publishing"],
        faqs: [
          { question: "Are all formats supported?", answer: "Support depends on the converter setup for this tool. Use the available options shown in the UI." },
          { question: "Can I convert large files?", answer: "Large files may take longer. Keep file sizes reasonable for best performance." },
        ],
        relatedTools: [{ slug: "pdf-image-extractor", name: "PDF Image Extractor" }, { slug: "csv-to-json", name: "CSV to JSON" }, { slug: "image-compressor", name: "Image Compressor" }],
      },
    },
    {
      name: "Regex Generator",
      slug: "regex-generator",
      icon: BsRegex,
      component: () => import("@/components/tools/regex-generator"),
      seo: {
        title: "Regex Generator",
        description: "Generate and test regular expressions quickly.",
      },
    },
  ],
  web: [
    {
      name: "URL Encoder",
      slug: "url-encoder",
      icon: FaGlobe,
      component: () => import("@/components/tools/url-encoder"),
      seo: {
        title: "URL Encoder",
        description: "Encode and decode URL components.",
      },
    },
    {
      name: "Text Extractor",
      slug: "text-extractor",
      icon: FaTextHeight,
      component: () => import("@/components/tools/text-extractor"),
      seo: {
        title: "Text Extractor",
        description: "Extract text from supported file formats.",
      },
    },
    {
      name: "SSL Checker",
      slug: "ssl-checker",
      icon: FaTextHeight,
      component: () => import("@/components/tools/ssl-checker"),
      seo: {
        title: "SSL Checker",
        description: "Check SSL certificate details for any domain.",
      },
    },
    {
      name: "JWT Debugger",
      slug: "jwt-debugger",
      icon: FaTextHeight,
      component: () => import("@/components/tools/jwt-debugger"),
      seo: {
        title: "JWT Debugger",
        description: "Decode and inspect JWT tokens safely.",
      },
    },
    {
      name: "FaviconGenerator",
      slug: "favicon-generator",
      icon: TbFavicon,
      component: () => import("@/components/tools/favicon-generator"),
      seo: {
        title: "Favicon Generator",
        description: "Create and export favicons for your site.",
      },
    },
    {
      name: "WebsiteCostCalculator",
      slug: "website-cost-calculator",
      icon: TbFavicon,
      component: () => import("@/components/tools/website-cost-calculator"),
      seo: {
        title: "Website Cost Calculator",
        description: "Estimate website development costs.",
      },
    },
  ],
  generators: [
    {
      name: "Lorem Ipsum Generator",
      slug: "lorem-ipsum-generator",
      icon: FaTextHeight,
      component: () => import("@/components/tools/lorem-ipsum-generator"),
      seo: {
        title: "Lorem Ipsum Generator",
        description: "Generate placeholder lorem ipsum text quickly.",
      },
    },
    {
      name: "QR Code Tool",
      slug: "qr-code-tool",
      icon: FaQrcode,
      component: () => import("@/components/tools/qr-code-tool"),
      seo: {
        title: "QR Code Tool",
        description: "Generate downloadable QR codes online.",
      },
    },
    {
      name: "Hash Generator",
      slug: "hash-generator",
      icon: TbVectorBezier,
      component: () => import("@/components/tools/hash-generator"),
      seo: {
        title: "Hash Generator",
        description: "Generate secure hashes for text input.",
      },
    },
    {
      name: "Password Generator",
      slug: "password-generator",
      icon: TbVectorBezier,
      component: () => import("@/components/tools/password-generator"),
      seo: {
        title: "Password Generator",
        description: "Create strong, customizable passwords instantly.",
      },
    },
    {
      name: "Data URI Generator",
      slug: "data-uri-generator",
      icon: TbVectorBezier,
      component: () => import("@/components/tools/data-uri-generator"),
      seo: {
        title: "Data URI Generator",
        description: "Convert files into data URI strings.",
      },
    },
  ],
  health: [
    {
      name: "Nutrition Master",
      slug: "nutrition-master",
      icon: FaTextHeight,
      component: () => import("@/components/tools/nutrition-master"),
      seo: {
        title: "Nutrition Master",
        description: "Plan and track nutrition with smart insights.",
      },
    },
  ],
};

export const categoryTitles = {
  image: "Image Tools",
  converters: "Converters",
  text: "Text Tools",
  calculators: "Calculators",
  file: "File Tools",
  web: "Web Tools",
  generators: "Generators",
  health: "Health Tools",
};

export const getAllTools = () => {
  return Object.values(toolsByCategory).flat();
};

export const getToolBySlug = (slug) => {
  return Object.values(toolsByCategory)
    .flat()
    .find((tool) => tool.slug === slug);
};

export const getToolCategoryBySlug = (slug) => {
  return Object.entries(toolsByCategory).find(([, tools]) => tools.some((tool) => tool.slug === slug))?.[0] ?? null;
};

const getToolTerms = (tool) => {
  const keywordSource = [tool.name, tool.seo?.title, tool.seo?.description, tool.seo?.keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return new Set(keywordSource.split(/[^a-z0-9]+/).filter((term) => term.length > 2));
};

export const getRelatedTools = (slug, limit = 6) => {
  const sourceTool = getToolBySlug(slug);
  if (!sourceTool) return [];

  const sourceCategory = getToolCategoryBySlug(slug);
  const sourceTerms = getToolTerms(sourceTool);
  const allTools = getAllTools().filter((tool) => tool.slug !== slug);

  const rankedTools = allTools
    .map((tool) => {
      const toolTerms = getToolTerms(tool);
      const sharedTerms = [...sourceTerms].filter((term) => toolTerms.has(term)).length;
      const sameCategoryBoost = sourceCategory && toolsByCategory[sourceCategory]?.some((item) => item.slug === tool.slug) ? 2 : 0;
      return { tool, score: sharedTerms + sameCategoryBoost };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.tool);

  return rankedTools;
};

export const getToolCategories = () => {
  return [
    {
      id: "image",
      title: "Image Tools",
      description: "Resize, convert and edit images",
      color: "#F97316",
      count: `${toolsByCategory.image.length} tools`,
      icon: FaImage,
      link: "/tools/image",
    },
    {
      id: "converters",
      title: "Converters",
      description: "Various format converters",
      color: "#8B5CF6",
      count: `${toolsByCategory.converters.length} tools`,
      icon: FaExchangeAlt,
      link: "/tools/converters",
    },
    {
      id: "text",
      title: "Text Tools",
      description: "Text formatting and analysis",
      color: "#06B6D4",
      count: `${toolsByCategory.text.length} tools`,
      icon: BiText,
      link: "/tools/text",
    },
    {
      id: "calculators",
      title: "Calculators",
      description: "Various calculation tools",
      color: "#10B981",
      count: `${toolsByCategory.calculators.length} tools`,
      icon: FaCalculator,
      link: "/tools/calculators",
    },
    {
      id: "file",
      title: "File Tools",
      description: "File conversion and management",
      color: "#0D9488",
      count: `${toolsByCategory.file.length} tools`,
      icon: FaFile,
      link: "/tools/file",
    },
    {
      id: "web",
      title: "Web Tools",
      description: "Web development utilities",
      color: "#EC4899",
      count: `${toolsByCategory.web.length} tools`,
      icon: FaGlobe,
      link: "/tools/web",
    },
    {
      id: "generators",
      title: "Generators",
      description: "Code and content generators",
      color: "#F59E0B",
      count: `${toolsByCategory.generators.length} tools`,
      icon: FaQrcode,
      link: "/tools/generators",
    },
    {
      id: "health",
      title: "Health Tools",
      description: "Health and fitness utilities",
      color: "#F43F5E",
      count: `${toolsByCategory.health.length} tools`,
      icon: FaHeartbeat,
      link: "/tools/health",
    },
  ];
};
