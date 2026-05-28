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
      seoContent: {
        h1: "Profile Picture Optimizer",
        intro: "Crop, resize, and enhance profile photos for social platforms in one click.",
        howToUse: ["Upload your photo.", "Select the platform or custom size.", "Adjust the crop and download."],
        features: ["Auto face detection", "Platform presets", "Optional background cleanup"],
        benefits: ["Uniform profile appearance", "No manual cropping guesswork", "Ready-to-upload images"],
        useCases: ["LinkedIn headshots", "Instagram profile pics", "Team page photos"],
        faqs: [
          { question: "Does it work with group photos?", answer: "It works best with single-person shots, but you can manually adjust the crop area." },
          { question: "Will the photo quality be reduced?", answer: "The output is optimized for social media use; noticeable loss is minimal." },
        ],
        relatedTools: [{ slug: "image-resizer", name: "Image Resizer" }, { slug: "image-compressor", name: "Image Compressor" }, { slug: "remove-background", name: "Remove Background" }],
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
      seoContent: {
        h1: "Video Thumbnail Generator",
        intro: "Capture a frame from your video and save it as a thumbnail image.",
        howToUse: ["Upload a video file.", "Scrub to the desired frame.", "Download the thumbnail."],
        features: ["Frame preview", "Common video format support", "Instant extraction"],
        benefits: ["No video editing software needed", "Fast content preview creation", "Ideal for YouTube creators"],
        useCases: ["YouTube thumbnails", "Video portfolio covers", "Social media teasers"],
        faqs: [
          { question: "Which video formats are supported?", answer: "MP4, WebM, and other common browser-supported formats." },
          { question: "Can I extract multiple thumbnails at once?", answer: "Currently you can extract one frame at a time." },
        ],
        relatedTools: [{ slug: "mp4-to-gif", name: "Mp4ToGif" }, { slug: "image-resizer", name: "Image Resizer" }],
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
      seoContent: {
        h1: "Color Picker",
        intro: "Pick, convert, and copy colors in multiple formats.",
        howToUse: ["Use the color wheel or enter a value.", "Adjust the shade.", "Copy the hex, RGB, or HSL code."],
        features: ["Interactive color wheel", "Multiple color formats", "Live preview"],
        benefits: ["Quick color extraction", "Helpful for design workflows", "No install needed"],
        useCases: ["UI/UX design", "Brand palette creation", "CSS styling"],
        faqs: [
          { question: "Can I see complementary colors?", answer: "The tool focuses on picking and converting; complementary generation may be added later." },
          { question: "Is the picked color saved?", answer: "You can copy the value; the page does not store history." },
        ],
        relatedTools: [{ slug: "svg-converter", name: "SvgConverter" }, { slug: "image-to-svg", name: "ImageToSvg" }],
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
      seoContent: {
        h1: "Svg Converter",
        intro: "Convert SVG files to other image formats and vice versa.",
        howToUse: ["Upload or paste SVG code.", "Choose the output format.", "Download the converted file."],
        features: ["SVG to PNG/JPEG", "Basic format conversion", "Preview before download"],
        benefits: ["Makes vector graphics more shareable", "Quick raster fallback", "Browser-based"],
        useCases: ["Preparing icons for websites", "Sharing vector art", "Exporting for presentations"],
        faqs: [
          { question: "Will the SVG lose quality when converted to PNG?", answer: "The output resolution matches your chosen size; scaling down preserves sharpness." },
          { question: "Can I convert PNG to SVG?", answer: "This tool is primarily SVG to raster; for raster to SVG, try the Image to SVG tool." },
        ],
        relatedTools: [{ slug: "image-to-svg", name: "ImageToSvg" }, { slug: "color-picker", name: "Color Picker" }, { slug: "image-resizer", name: "Image Resizer" }],
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
      seoContent: {
        h1: "Image to SVG",
        intro: "Convert PNG, JPG, WEBP and other raster images into scalable SVG vectors with advanced tracing.",
        howToUse: ["Upload your image.", "Choose a conversion mode.", "Adjust SVG quality if needed.", "Download the generated SVG."],
        features: ["Advanced vector tracing", "Multiple conversion modes", "Supports common image formats", "Live SVG preview", "Editable SVG output"],
        benefits: ["Scale images without quality loss", "Generate editable SVG files", "Perfect for logos and icons"],
        useCases: ["Logo vectorization", "Converting sketches", "Creating SVG graphics"],
        faqs: [
          { question: "Does it work for photographs?", answer: "Yes, but best results are achieved with logos, icons and illustrations." },
          { question: "Which image formats are supported?", answer: "PNG, JPG, JPEG, WEBP, GIF, BMP and other common formats are supported." },
        ],
        relatedTools: [{ slug: "svg-converter", name: "SvgConverter" }, { slug: "remove-background", name: "RemoveBackground" }, { slug: "color-picker", name: "Color Picker" }],
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
      seoContent: {
        h1: "Mp4ToGif",
        intro: "Turn short MP4 clips into shareable, looping GIFs.",
        howToUse: ["Upload an MP4 video.", "Trim the clip and set quality.", "Convert and download the GIF."],
        features: ["Trim and resize", "Quality slider", "Instant preview"],
        benefits: ["Lightweight GIF output", "Perfect for social sharing", "No watermark"],
        useCases: ["Reaction GIFs", "Product demos", "Social media posts"],
        faqs: [
          { question: "Is there a file size limit?", answer: "Large files may be processed slowly; keep videos under a few minutes for best results." },
          { question: "Can I adjust the frame rate?", answer: "Yes, you can choose the FPS for the output GIF." },
        ],
        relatedTools: [{ slug: "video-thumbnail-generator", name: "Video Thumbnail Generator" }, { slug: "image-compressor", name: "Image Compressor" }],
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
      seoContent: {
        h1: "Unit Converter",
        intro: "Convert between length, weight, temperature, and more.",
        howToUse: ["Select a category.", "Enter a value and choose units.", "See instant conversion results."],
        features: ["Multiple unit categories", "Real-time conversion", "Common units covered"],
        benefits: ["No manual calculations", "Quick reference", "Works offline"],
        useCases: ["Cooking measurements", "Travel distances", "Science homework"],
        faqs: [
          { question: "Which categories are available?", answer: "Length, weight, temperature, volume, and area." },
          { question: "Are the conversions accurate?", answer: "They follow standard conversion factors." },
        ],
        relatedTools: [{ slug: "currency-converter", name: "Currency Converter" }, { slug: "percentage-calculator", name: "Percentage Calculator" }],
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
      seoContent: {
        h1: "Case Converter",
        intro: "Change text to uppercase, lowercase, title case, and more.",
        howToUse: ["Paste your text.", "Choose a case style.", "Copy the transformed text."],
        features: ["Multiple case styles", "One-click transform", "Preserves line breaks"],
        benefits: ["Saves retyping effort", "Consistent formatting", "Helpful for coding and writing"],
        useCases: ["Fixing accidental caps lock", "Preparing headlines", "Formatting code identifiers"],
        faqs: [
          { question: "Does it support sentence case?", answer: "Yes, sentence case capitalizes the first letter of each sentence." },
          { question: "Can I undo a transformation?", answer: "Keep your original text; the tool outputs a transformed copy." },
        ],
        relatedTools: [{ slug: "word-counter", name: "Word Counter" }, { slug: "text-diff-checker", name: "Text Diff Checker" }],
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
      seoContent: {
        h1: "Currency Converter",
        intro: "Get live exchange rates and convert between world currencies.",
        howToUse: ["Enter an amount.", "Select source and target currencies.", "View the converted value."],
        features: ["Live rates", "Wide currency support", "Swap currencies instantly"],
        benefits: ["Accurate travel budgeting", "Quick e-commerce estimates", "No manual rate lookups"],
        useCases: ["Online shopping abroad", "Travel planning", "Freelance invoicing"],
        faqs: [
          { question: "How often are rates updated?", answer: "Rates are fetched from a reliable source and updated regularly." },
          { question: "Does it include cryptocurrencies?", answer: "Currently only fiat currencies are supported." },
        ],
        relatedTools: [{ slug: "unit-converter", name: "Unit Converter" }, { slug: "percentage-calculator", name: "Percentage Calculator" }],
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
      seoContent: {
        h1: "Base64 Converter",
        intro: "Encode text or files to Base64, and decode Base64 strings back.",
        howToUse: ["Enter text or upload a file.", "Choose encode or decode.", "Copy or download the result."],
        features: ["Text and file support", "Instant conversion", "Copy to clipboard"],
        benefits: ["Data-safe encoding", "Works for inline images", "Quick developer utility"],
        useCases: ["Embedding images in CSS", "API data transfer", "Debugging encoded payloads"],
        faqs: [
          { question: "Is Base64 encryption?", answer: "No, it is an encoding method and not secure encryption." },
          { question: "Can I convert large files?", answer: "The tool works best with moderate-sized inputs." },
        ],
        relatedTools: [{ slug: "json-formatter", name: "JSON Formatter" }, { slug: "url-encoder", name: "URL Encoder" }],
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
      seoContent: {
        h1: "Word Counter",
        intro: "Count words, characters, sentences, and paragraphs instantly.",
        howToUse: ["Type or paste text.", "View live statistics.", "Use the reading time estimate."],
        features: ["Real-time counts", "Character and word stats", "Reading time"],
        benefits: ["Stay within content limits", "Improve writing clarity", "Quick feedback"],
        useCases: ["Essay writing", "Social media captions", "SEO meta descriptions"],
        faqs: [
          { question: "Does it count spaces?", answer: "Character count can include or exclude spaces depending on the view." },
          { question: "Can I count words in a document?", answer: "You can paste the text directly." },
        ],
        relatedTools: [{ slug: "case-converter", name: "Case Converter" }, { slug: "text-diff-checker", name: "Text Diff Checker" }, { slug: "markdown-previewer", name: "Markdown Previewer" }],
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
      seoContent: {
        h1: "JSON Formatter",
        intro: "Beautify, validate, and minify JSON data with ease.",
        howToUse: ["Paste JSON code.", "Choose format or validate.", "Copy the output."],
        features: ["Pretty print", "Error detection", "Minify option"],
        benefits: ["Readable API responses", "Quick debugging", "No install needed"],
        useCases: ["API development", "Configuration files", "Data inspection"],
        faqs: [
          { question: "What if my JSON is invalid?", answer: "An error message will highlight the issue." },
          { question: "Can it handle large JSON files?", answer: "It works well with typical file sizes; extremely large files may slow the browser." },
        ],
        relatedTools: [{ slug: "csv-to-json", name: "CSV to JSON" }, { slug: "xml-formatter", name: "XML Formatter" }, { slug: "base64-converter", name: "Base64 Converter" }],
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
      seoContent: {
        h1: "Markdown Previewer",
        intro: "Write markdown and see a live HTML preview side by side.",
        howToUse: ["Type or paste markdown in the editor.", "Watch the formatted preview update.", "Copy the raw or rendered text."],
        features: ["Live preview", "CommonMark support", "Clean interface"],
        benefits: ["Streamlined writing", "Instant formatting feedback", "Great for README drafts"],
        useCases: ["README files", "Documentation drafts", "Note-taking"],
        faqs: [
          { question: "Does it support GitHub Flavored Markdown?", answer: "It covers most basic syntax; some extensions may not render." },
          { question: "Can I export to HTML?", answer: "You can copy the rendered HTML from the preview." },
        ],
        relatedTools: [{ slug: "word-counter", name: "Word Counter" }, { slug: "text-diff-checker", name: "Text Diff Checker" }],
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
      seoContent: {
        h1: "Text Diff Checker",
        intro: "Compare two text blocks and see added, removed, and unchanged lines.",
        howToUse: ["Paste original and modified text.", "View inline differences.", "Copy or clear results."],
        features: ["Line-by-line comparison", "Color-coded changes", "Side-by-side view"],
        benefits: ["Spot changes quickly", "Useful for version control", "No login required"],
        useCases: ["Code review", "Contract revisions", "Article edits"],
        faqs: [
          { question: "Can I compare files?", answer: "Paste the contents; file upload may be added in the future." },
          { question: "Is the comparison case-sensitive?", answer: "Yes, it treats text exactly as entered." },
        ],
        relatedTools: [{ slug: "word-counter", name: "Word Counter" }, { slug: "markdown-previewer", name: "Markdown Previewer" }, { slug: "case-converter", name: "Case Converter" }],
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
      seoContent: {
        h1: "Percentage Calculator",
        intro: "Find percentages, percentage increases, and more with a simple interface.",
        howToUse: ["Enter the values.", "Choose the calculation type.", "View the result."],
        features: ["Multiple percentage formulas", "Clear input fields", "Instant result"],
        benefits: ["Avoid manual math errors", "Fast discounts and tips", "Easy to use"],
        useCases: ["Shopping discounts", "Tip calculation", "Grade percentages"],
        faqs: [
          { question: "Can it calculate percentage change?", answer: "Yes, select the increase/decrease option." },
          { question: "Does it show the formula?", answer: "The calculation uses standard formulas behind the scenes." },
        ],
        relatedTools: [{ slug: "age-calculator", name: "Age Calculator" }, { slug: "time-calculator", name: "Time Calculator" }, { slug: "unit-converter", name: "Unit Converter" }],
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
      seoContent: {
        h1: "Age Calculator",
        intro: "Find your exact age in years, months, and days from your birth date.",
        howToUse: ["Enter your birth date.", "Click calculate.", "See your age breakdown."],
        features: ["Precise age output", "Years, months, days", "Simple date picker"],
        benefits: ["Accurate birthday planning", "Quick age verification", "Fun to use"],
        useCases: ["Form filling", "Birthday surprises", "Age eligibility checks"],
        faqs: [
          { question: "Does it account for leap years?", answer: "Yes, the calculation includes leap year adjustments." },
          { question: "Can I calculate age for future dates?", answer: "You can input any date to see the difference." },
        ],
        relatedTools: [{ slug: "time-calculator", name: "Time Calculator" }, { slug: "percentage-calculator", name: "Percentage Calculator" }],
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
      seoContent: {
        h1: "Time Calculator",
        intro: "Perform time addition, subtraction, and conversion between units.",
        howToUse: ["Enter time values.", "Choose operation.", "Get the result."],
        features: ["Add/subtract hours and minutes", "Convert to decimal", "Clear reset"],
        benefits: ["Simplify timesheet calculations", "Avoid time math mistakes", "Quick project estimates"],
        useCases: ["Work hour tracking", "Event planning", "Cooking timers"],
        faqs: [
          { question: "Can I mix hours and minutes?", answer: "Yes, enter values in separate fields." },
          { question: "Does it handle seconds?", answer: "Currently it focuses on hours and minutes." },
        ],
        relatedTools: [{ slug: "age-calculator", name: "Age Calculator" }, { slug: "percentage-calculator", name: "Percentage Calculator" }],
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
      seoContent: {
        h1: "CSV to JSON",
        intro: "Transform comma-separated data into structured JSON objects.",
        howToUse: ["Upload a CSV file or paste content.", "Set delimiter if needed.", "Copy or download the JSON."],
        features: ["Auto-detect delimiter", "Preview output", "Download as .json"],
        benefits: ["Data interchange ready", "API-friendly format", "Quick migration"],
        useCases: ["Database seeding", "Configuration generation", "Data analysis prep"],
        faqs: [
          { question: "What if my CSV uses semicolons?", answer: "You can specify the custom delimiter." },
          { question: "Does it handle nested JSON?", answer: "It creates flat JSON arrays from rows." },
        ],
        relatedTools: [{ slug: "json-formatter", name: "JSON Formatter" }, { slug: "xml-formatter", name: "XML Formatter" }, { slug: "file-converter", name: "File Converter" }],
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
      seoContent: {
        h1: "XML Formatter",
        intro: "Indent, validate, and minify XML documents.",
        howToUse: ["Paste XML data.", "Choose format or validate.", "Copy the result."],
        features: ["Pretty print", "Syntax check", "Minify output"],
        benefits: ["Improves readability", "Helps spot errors", "Quick developer tool"],
        useCases: ["SOAP APIs", "Configuration files", "Data feeds"],
        faqs: [
          { question: "Can it fix invalid XML?", answer: "It validates but cannot automatically repair structural errors." },
          { question: "Is there a size limit?", answer: "Large files may be slow; keep under a few MB." },
        ],
        relatedTools: [{ slug: "csv-to-json", name: "CSV to JSON" }, { slug: "json-formatter", name: "JSON Formatter" }],
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
      seoContent: {
        h1: "File Rename Tool",
        intro: "Rename multiple files at once using custom rules and patterns.",
        howToUse: ["Upload files.", "Set naming pattern.", "Preview and apply rename."],
        features: ["Find and replace", "Numbering sequences", "Case changes"],
        benefits: ["Save time on manual renaming", "Consistent file naming", "Ideal for photo sets"],
        useCases: ["Photo organization", "Document archiving", "Project file cleanup"],
        faqs: [
          { question: "Can I undo a rename?", answer: "The tool applies the new names; it’s recommended to keep backups." },
          { question: "Does it support regular expressions?", answer: "Basic find-and-replace is available; regex may be added later." },
        ],
        relatedTools: [{ slug: "file-converter", name: "File Converter" }, { slug: "csv-to-json", name: "CSV to JSON" }],
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
      seoContent: {
        h1: "Regex Generator",
        intro: "Build and test regular expressions with live matching.",
        howToUse: ["Enter a sample text.", "Write or generate a pattern.", "See matches highlighted."],
        features: ["Pattern builder", "Match highlighting", "Common regex snippets"],
        benefits: ["Learn regex faster", "Test before implementing", "Handy for text processing"],
        useCases: ["Form validation", "Data extraction", "Log parsing"],
        faqs: [
          { question: "Does it support all regex flavors?", answer: "It uses JavaScript regex syntax." },
          { question: "Can I save my patterns?", answer: "You can copy the pattern; no server-side save." },
        ],
        relatedTools: [{ slug: "text-diff-checker", name: "Text Diff Checker" }, { slug: "json-formatter", name: "JSON Formatter" }],
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
      seoContent: {
        h1: "URL Encoder",
        intro: "Encode special characters for safe URLs, or decode them back.",
        howToUse: ["Paste a URL or string.", "Choose encode or decode.", "Copy the result."],
        features: ["Encode/decode toggle", "Preserves structure", "One-click copy"],
        benefits: ["Clean query parameters", "Prevent broken links", "Essential for web dev"],
        useCases: ["Building API requests", "Sharing complex URLs", "Debugging redirects"],
        faqs: [
          { question: "Does it encode spaces as %20 or +?", answer: "It uses percent-encoding as per the encodeURIComponent standard." },
          { question: "Can I decode a full URL?", answer: "Yes, but be careful with already decoded parts." },
        ],
        relatedTools: [{ slug: "base64-converter", name: "Base64 Converter" }, { slug: "ssl-checker", name: "SSL Checker" }],
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
      seoContent: {
        h1: "Text Extractor",
        intro: "Pull plain text from documents, images (via OCR), or code files.",
        howToUse: ["Upload a file.", "Wait for extraction.", "Copy or download the text."],
        features: ["OCR support", "Plain text output", "Multiple formats"],
        benefits: ["Recover editable text", "No manual retyping", "Broad file support"],
        useCases: ["Scanning printed documents", "Extracting code comments", "Reusing old PDFs"],
        faqs: [
          { question: "Does it keep formatting?", answer: "It extracts raw text; formatting may be lost." },
          { question: "Which image formats work for OCR?", answer: "JPG and PNG with clear text yield best results." },
        ],
        relatedTools: [{ slug: "pdf-image-extractor", name: "PDF Image Extractor" }, { slug: "word-counter", name: "Word Counter" }],
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
      seoContent: {
        h1: "SSL Checker",
        intro: "Inspect the SSL certificate of a website for validity and details.",
        howToUse: ["Enter a domain name.", "Click check.", "View certificate info."],
        features: ["Expiry date", "Issuer details", "Certificate chain"],
        benefits: ["Ensure site security", "Avoid expired certificates", "Quick diagnostics"],
        useCases: ["Website maintenance", "Security audits", "Before purchasing domains"],
        faqs: [
          { question: "Does it check for mixed content?", answer: "It only retrieves certificate information, not page content." },
          { question: "Can I check any domain?", answer: "Yes, as long as it has a publicly accessible SSL certificate." },
        ],
        relatedTools: [{ slug: "url-encoder", name: "URL Encoder" }, { slug: "jwt-debugger", name: "JWT Debugger" }],
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
      seoContent: {
        h1: "JWT Debugger",
        intro: "Decode the header and payload of a JSON Web Token without verifying signature.",
        howToUse: ["Paste a JWT.", "View decoded parts.", "Check claims."],
        features: ["Decode header/payload", "Claims display", "Copy decoded data"],
        benefits: ["Understand token structure", "Debug authentication", "No backend needed"],
        useCases: ["API troubleshooting", "Learning OAuth", "Token inspection"],
        faqs: [
          { question: "Does it verify the signature?", answer: "No, it only decodes; signature verification requires a secret." },
          { question: "Is my token safe?", answer: "Processing happens locally in the browser." },
        ],
        relatedTools: [{ slug: "base64-converter", name: "Base64 Converter" }, { slug: "ssl-checker", name: "SSL Checker" }],
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
      seoContent: {
        h1: "Favicon Generator",
        intro: "Turn an image into a multi-size favicon package for websites.",
        howToUse: ["Upload an image.", "Preview favicon sizes.", "Download the .ico and PNGs."],
        features: ["Multiple sizes", "ICO and PNG output", "Instant generation"],
        benefits: ["Professional site branding", "Better bookmark display", "Time saver"],
        useCases: ["New website launch", "Rebranding", "PWA icons"],
        faqs: [
          { question: "What image should I upload?", answer: "A square image at least 260x260 px works best." },
          { question: "Do I need an .ico file?", answer: "The tool provides both .ico and modern PNG sizes." },
        ],
        relatedTools: [{ slug: "image-resizer", name: "Image Resizer" }, { slug: "svg-converter", name: "SvgConverter" }],
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
      seoContent: {
        h1: "Website Cost Calculator",
        intro: "Get a rough estimate for building a website based on features.",
        howToUse: ["Select desired features.", "Choose complexity level.", "View estimated cost range."],
        features: ["Feature-based pricing", "Instant estimate", "Transparent assumptions"],
        benefits: ["Budget planning", "Compare options", "No sales calls"],
        useCases: ["Startup planning", "Client proposals", "Freelance pricing"],
        faqs: [
          { question: "How accurate is the estimate?", answer: "It provides a ballpark figure; actual costs vary by region and developer." },
          { question: "Does it include hosting?", answer: "The estimate covers development; hosting and domain are separate." },
        ],
        relatedTools: [{ slug: "percentage-calculator", name: "Percentage Calculator" }, { slug: "unit-converter", name: "Unit Converter" }],
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
      seoContent: {
        h1: "Lorem Ipsum Generator",
        intro: "Create dummy text for design mockups and layouts.",
        howToUse: ["Specify paragraphs, words, or bytes.", "Click generate.", "Copy the text."],
        features: ["Customizable length", "Classic Lorem Ipsum", "Instant copy"],
        benefits: ["Filler text without distraction", "Faster mockup creation", "Consistent formatting"],
        useCases: ["UI prototypes", "Print layouts", "Content placeholders"],
        faqs: [
          { question: "Can I generate in other languages?", answer: "Currently it generates traditional Latin-like placeholder text." },
          { question: "Is there a word limit?", answer: "You can generate up to a reasonable amount for browser performance." },
        ],
        relatedTools: [{ slug: "word-counter", name: "Word Counter" }, { slug: "text-diff-checker", name: "Text Diff Checker" }],
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
      seoContent: {
        h1: "QR Code Tool",
        intro: "Create QR codes for URLs, text, and contact info.",
        howToUse: ["Enter the data to encode.", "Customize size and color.", "Download the QR image."],
        features: ["URL/text encoding", "PNG download", "Simple customization"],
        benefits: ["Contactless sharing", "Marketing material", "Quick setup"],
        useCases: ["Event tickets", "Wi-Fi credentials", "Business cards"],
        faqs: [
          { question: "Can I add a logo in the center?", answer: "Basic logo overlay is supported." },
          { question: "What’s the maximum data size?", answer: "QR codes have capacity limits; shorter URLs work best." },
        ],
        relatedTools: [{ slug: "url-encoder", name: "URL Encoder" }, { slug: "base64-converter", name: "Base64 Converter" }],
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
      seoContent: {
        h1: "Hash Generator",
        intro: "Compute MD5, SHA-1, SHA-256, and other hashes from any text.",
        howToUse: ["Enter text.", "Select algorithm.", "Copy the hash."],
        features: ["Multiple algorithms", "Instant generation", "Copy to clipboard"],
        benefits: ["Verify file integrity", "Obfuscate data", "No server needed"],
        useCases: ["Checksum verification", "Password storage (with salt)", "Data fingerprinting"],
        faqs: [
          { question: "Is SHA-256 secure?", answer: "It’s considered cryptographically secure for many applications." },
          { question: "Can I hash a file?", answer: "You can paste the file’s text content; binary hashing is not supported." },
        ],
        relatedTools: [{ slug: "password-generator", name: "Password Generator" }, { slug: "base64-converter", name: "Base64 Converter" }],
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
      seoContent: {
        h1: "Password Generator",
        intro: "Generate random, secure passwords with adjustable length and character sets.",
        howToUse: ["Set length and options.", "Click generate.", "Copy the password."],
        features: ["Length control", "Include symbols", "Avoid ambiguous chars"],
        benefits: ["Stronger account security", "No repeated patterns", "Local generation"],
        useCases: ["New account setup", "Password resets", "Security audits"],
        faqs: [
          { question: "Are the passwords stored?", answer: "No, they are generated in your browser and not saved." },
          { question: "What makes a password strong?", answer: "Length and a mix of character types increase strength." },
        ],
        relatedTools: [{ slug: "hash-generator", name: "Hash Generator" }, { slug: "base64-converter", name: "Base64 Converter" }],
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
      seoContent: {
        h1: "Data URI Generator",
        intro: "Embed images or files directly into CSS or HTML with data URIs.",
        howToUse: ["Upload a file.", "View the generated data URI.", "Copy the string."],
        features: ["Image to Base64 URI", "MIME type detection", "Copy button"],
        benefits: ["Fewer HTTP requests", "Inline assets", "Quick embedding"],
        useCases: ["Email signatures", "CSS backgrounds", "Single-file demos"],
        faqs: [
          { question: "Does it work for large files?", answer: "Data URIs can become very long; small files are recommended." },
          { question: "Will the URI expire?", answer: "No, it’s a static string representing the file content." },
        ],
        relatedTools: [{ slug: "base64-converter", name: "Base64 Converter" }, { slug: "image-resizer", name: "Image Resizer" }],
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
      seoContent: {
        h1: "Nutrition Master",
        intro: "Log meals and view macro breakdowns to stay on track.",
        howToUse: ["Search for food items.", "Add to daily log.", "Review nutritional totals."],
        features: ["Food database", "Macro tracking", "Daily summary"],
        benefits: ["Achieve health goals", "Awareness of eating habits", "Convenient tracking"],
        useCases: ["Weight management", "Meal prep", "Fitness planning"],
        faqs: [
          { question: "Is the food database comprehensive?", answer: "It includes common foods; you can add custom items." },
          { question: "Can I track micronutrients?", answer: "The focus is on macros; vitamin tracking may be added later." },
        ],
        relatedTools: [{ slug: "percentage-calculator", name: "Percentage Calculator" }, { slug: "age-calculator", name: "Age Calculator" }],
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