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
    FaFileCsv
} from 'react-icons/fa';
import {
    MdFormatColorText,
    MdOutlineImage,
    MdOutlineCurrencyExchange,
    MdAutoFixHigh,
    MdOutlineDriveFileRenameOutline
} from 'react-icons/md';
import {  
    BiCodeAlt,
    BiText
} from 'react-icons/bi';
import {
    AiOutlineFileText
} from 'react-icons/ai';
import {
    TbBinaryTree,
    TbFavicon,
    TbVectorBezier,
    TbVectorTriangle
} from 'react-icons/tb';


import { BsFiletypeSvg, BsRegex } from "react-icons/bs"
import { VscFilePdf } from "react-icons/vsc"
// Only include categories that have tools.

export const toolsByCategory = {
    image: [
        { name: "Image Resizer", link: "/image-resizer", icon: MdOutlineImage },
        { name: "Color Picker", link: "/color-picker", icon: FaPalette },
        { name: "SvgConverter", link: "/svg-converter", icon: BsFiletypeSvg },
        { name: "ImageToSvg", link: "/image-to-svg", icon: TbVectorTriangle },
        { name: "RemoveBackground", link: "/remove-background", icon: MdAutoFixHigh },
        { name: "Mp4ToGif", link: "/mp4-to-gif", icon: FaBeer },
    ],
    converters: [
        { name: "Unit Converter", link: "/unit-converter", icon: FaExchangeAlt },
        { name: "Case Converter", link: "/case-converter", icon: MdFormatColorText },
        { name: "Currency Converter", link: "/currency-converter", icon: MdOutlineCurrencyExchange },
        { name: "Base64 Converter", link: "/base64-converter", icon: TbBinaryTree },

    ],
    text: [
        { name: "Word Counter", link: "/word-counter", icon: AiOutlineFileText },
        { name: "JSON Formatter", link: "/json-formatter", icon: FaFileCode },
        { name: "Markdown Previewer", link: "/markdown-previewer", icon: BiCodeAlt },
        { name: "Text Diff Checker", link: "/text-diff-checker", icon: BiText },
        { name: "PDFImageExtractor", link: "/pdfImage-extractor", icon: VscFilePdf },
    ],
    calculators: [
        { name: "Percentage Calculator", link: "/percentage-calculator", icon: FaCalculator },
        { name: "Age Calculator", link: "/age-calculator", icon: FaCalculator },
        { name: "Time Calculator", link: "/time-calculator", icon: FaCalculator },
    ],
    file: [
        { name: "CSV to JSON", link: "/csv-to-json", icon: FaFile },
        { name: "XML Formatter", link: "/xml-formatter", icon: FaFileCode },
        { name: "File Rename Tool", link: "/file-rename-tool", icon: MdOutlineDriveFileRenameOutline },
        { name: "File Converter", link: "/file-converter", icon: FaFileCsv },
        { name: "Regex Generator", link: "/regex-generator", icon: BsRegex },
        
    ],
    web: [
        { name: "URL Encoder", link: "/url-encoder", icon: FaGlobe },
        { name: "Text Extractor", link: "/text-extractor", icon: FaTextHeight },
        { name: "SSL Checker", link: "/ssl-checker", icon: FaTextHeight },
        { name: "JWT Debugger", link: "/jwt-debugger", icon: FaTextHeight },
        { name: "FaviconGenerator", link: "/favicon-generator", icon: TbFavicon },
        { name: "WebsiteCostCalculator", link: "/website-cost-calculator", icon: TbFavicon },
    ],
    generators: [
        { name: "Lorem Ipsum Generator", link: "/lorem-ipsum-generator", icon: FaTextHeight },
        { name: "QR Code Tool", link: "/qr-code-tool", icon: FaQrcode },
        { name: "Hash Generator", link: "/hash-generator", icon: TbVectorBezier },
        { name: "Password Generator", link: "/password-generator", icon: TbVectorBezier },
        { name: "Data URI Generator", link: "/data-uri-generator", icon: TbVectorBezier },
    ],
    health: [
        { name: "Nutrition Master", link: "/nutrition-master", icon: FaTextHeight },
    ]
    
};

export const categoryTitles = {
    image: "Image Tools",
    converters: "Converters",
    text: "Text Tools",
    calculators: "Calculators",
    file: "File Tools",
    web: "Web Tools",
    generators: "Generators",
    health: "Health Tools"
};

export const getAllTools = () => {
    return Object.values(toolsByCategory).flat();
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
            link: "/tools/image"
        },
        {
            id: "converters",
            title: "Converters",
            description: "Various format converters",
            color: "#8B5CF6",
            count: `${toolsByCategory.converters.length} tools`,
            icon: FaExchangeAlt,
            link: "/tools/converters"
        },
        {
            id: "text",
            title: "Text Tools",
            description: "Text formatting and analysis",
            color: "#06B6D4",
            count: `${toolsByCategory.text.length} tools`,
            icon: BiText,
            link: "/tools/text"
        },
        {
            id: "calculators",
            title: "Calculators",
            description: "Various calculation tools",
            color: "#10B981",
            count: `${toolsByCategory.calculators.length} tools`,
            icon: FaCalculator,
            link: "/tools/calculators"
        },
        {
            id: "file",
            title: "File Tools",
            description: "File conversion and management",
            color: "#0D9488",
            count: `${toolsByCategory.file.length} tools`,
            icon: FaFile,
            link: "/tools/file"
        },
        {
            id: "web",
            title: "Web Tools",
            description: "Web development utilities",
            color: "#EC4899",
            count: `${toolsByCategory.web.length} tools`,
            icon: FaGlobe,
            link: "/tools/web"
        },
        {
            id: "generators",
            title: "Generators",
            description: "Code and content generators",
            color: "#F59E0B",
            count: `${toolsByCategory.generators.length} tools`,
            icon: FaQrcode,
            link: "/tools/generators"
        },
        {
            id: "health",
            title: "Health Tools",
            description: "Health and fitness utilities",
            color: "#F43F5E",
            count: `${toolsByCategory.health.length} tools`,
            icon: FaHeartbeat,
            link: "/tools/health"
        }
    ];
};