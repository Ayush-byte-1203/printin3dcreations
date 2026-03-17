/**
 * PRODUCT DATA CONFIGURATION
 * 
 * Image Storage:
 * - All images should be placed in: public/images/products/...
 * - Reference them starting with forward slash: "/images/products/your-image.jpg"
 */

export const topicsData = [
    {
        id: 1,
        title: "Custom Design",
        category: "Service",
        icon: "PencilRuler",
        desc: "Got a rough sketch or just an idea? Our team helps you turn your imagination into a printable 3D model.",
        details: "Our experts work with you to create high-quality, durable 3D designs from concept to reality."
    },
    {
        id: 2,
        title: "KeyChains",
        category: "Personalized",
        icon: "Key",
        desc: "Unique, personalized keychains tailored just for you or your brand.",
        details: "Specializing in personalized keychains, perfect for gifts or branded merchandise."
    },
    {
        id: 3,
        title: "Art & Decor",
        category: "Unique Gifts",
        icon: "Palette",
        desc: "Elevate your space with unique 3D-printed art and sophisticated home decor.",
        details: "From thoughtful gifts to stunning sculptures, find handcrafted pieces for every corner."
    },
    {
        id: 4,
        title: "Miniatures",
        category: "Pop Style",
        icon: "Gamepad2",
        desc: "Fun collectibles and pop-style miniature figures for every enthusiast.",
        details: "Detailed pop-style figures and tabletop miniatures captured in high-quality 3D form."
    },
    {
        id: 5,
        title: "Education Kits",
        category: "Learning",
        icon: "GraduationCap",
        desc: "Hands-on 3D printing kits that make learning fun and interactive.",
        details: "Designed for curious minds, these kits bring educational concepts to life in 3D."
    },
    {
        id: 6,
        title: "Photo Frames",
        category: "Memories",
        icon: "Image",
        desc: "Capture and hold your favorite memories in beautifully crafted 3D frames.",
        details: "Specialized 3D-printed frames that turn your digital photos into physical keepsakes."
    }
];

/**
 * SUB-PRODUCTS MAP
 * 
 * Each key (2, 3, etc.) matches the 'id' in topicsData above.
 * To add images:
 * 1. Create a folder in 'public/images/products/' for the category (e.g., 'keychains')
 * 2. Add your images there.
 * 3. Update the 'images' array for the specific product.
 *    - The first image in the array is used as the MAIN thumbnail.
 *    - All images in the array will appear in the detail page gallery.
 */
export const subProductsMap = {
    2: [ // Keychains
        {
            id: '2-1', name: "Classic Initials", price: 149,
            images: ["/images/products/keychains/initials-1.jpg", "/images/products/keychains/initials-2.jpg"],
            desc: "Your initials in a variety of stylish 3D fonts.",
            fullDetails: "Our Classic Initials keychains are the perfect personalized accessory. Each piece is custom-designed using high-precision 3D modeling to ensure clean lines and a professional finish.",
            specs: { material: "High-Grade PLA", dimensions: "40mm x 40mm x 5mm", weight: "12g" },
            features: ["Multiple font styles", "Durable construction", "Available in 10+ colors"]
        },
        {
            id: '2-2', name: "Cartoon Character", price: 249,
            images: ["/images/products/keychains/cartoon-1.jpg", "/images/products/keychains/cartoon-2.jpg"],
            desc: "Miniature versions of your favorite cartoon icons.",
            fullDetails: "Bring your favorite characters to your keys! These colorful, detailed miniatures are designed to withstand everyday wear and tear while looking great.",
            specs: { material: "Resin/PLA", dimensions: "50mm height", weight: "15g" },
            features: ["Hand-painted details", "Lightweight design", "Great for collectors"]
        },
        {
            id: '2-3', name: "Car Logo", price: 199,
            images: ["/images/products/keychains/car-1.jpg", "/images/products/keychains/car-2.jpg"],
            desc: "Detailed 3D logos of popular car brands.",
            fullDetails: "Show off your ride even when you're not driving. We offer high-fidelity 3D-printed versions of all major automotive brand logos.",
            specs: { material: "Metallic Finish PLA", dimensions: "45mm diameter", weight: "10g" },
            features: ["Sleek metallic look", "Weather resistant", "Accurate brand geometry"]
        },
        {
            id: '2-4', name: "Spotify Code", price: 299,
            images: ["/images/products/keychains/spotify-1.jpg", "/images/products/keychains/spotify-2.jpg"],
            desc: "Scan and play your favorite song directly from your keys.",
            fullDetails: "The ultimate musical gift. Simply provide your favorite song or playlist link, and we'll generate a scannable Spotify code in 3D form.",
            specs: { material: "Contrast PLA", dimensions: "60mm x 15mm x 4mm", weight: "8g" },
            features: ["Fully functional scanning", "Unique personalized gift", "Variety of color contrasts"]
        },
        {
            id: '2-5', name: "Mini Tool", price: 349,
            images: ["/images/products/keychains/tool-1.jpg", "/images/products/keychains/tool-2.jpg"],
            desc: "Functional mini-tools like wrenches and pliers as keychains.",
            fullDetails: "A conversation starter for any enthusiast. These mini tools actually move and function, showcasing the precision of our 3D printing technology.",
            specs: { material: "Tough Resin", dimensions: "55mm length", weight: "20g" },
            features: ["Moving parts", "High structural strength", "Industrial aesthetic"]
        }
    ],
    3: [ // Art
        {
            id: '3-1', name: "Voronoi Bear", price: 1299,
            images: ["/images/products/art/bear-1.jpg", "/images/products/art/bear-2.jpg"],
            desc: "A modern, geometric bear sculpture with intricate Voronoi patterns.",
            fullDetails: "This stunning sculpture merges biology and mathematics. The complex Voronoi mesh creates a skeletal yet robust structure that looks beautiful from every angle.",
            specs: { material: "Matte PLA", dimensions: "150mm height", printTime: "12 hours" },
            features: ["Complex geometry", "Self-supporting design", "Sophisticated decor piece"]
        },
        {
            id: '3-2', name: "Geometric Vase", price: 899,
            images: ["/images/products/art/vase-1.jpg", "/images/products/art/vase-2.jpg"],
            desc: "Sleek, multifaceted vase for contemporary home decor.",
            fullDetails: "A minimalist masterpiece. The low-poly design catches light in unique ways, creating a dynamic visual experience in your living space.",
            specs: { material: "Silk PLA", dimensions: "200mm height", weight: "180g" },
            features: ["Watertight design", "Shimmering silk finish", "Modern minimalist style"]
        },
        {
            id: '3-3', name: "Abstract Bust", price: 2499,
            images: ["/images/products/art/bust-1.jpg", "/images/products/art/bust-2.jpg"],
            desc: "A sophisticated piece of art that adds character to any room.",
            fullDetails: "Inspired by classical sculpture but reimagined through the lens of digital distortion. This piece is a statement in any home or office.",
            specs: { material: "Stone-filled Plastic", dimensions: "250mm height", weight: "500g" },
            features: ["Stone-like texture", "High weight for stability", "Exclusive digital design"]
        },
        {
            id: '3-4', name: "Low Poly Dog", price: 1599,
            images: ["/images/products/art/dog-1.jpg", "/images/products/art/dog-2.jpg"],
            desc: "Adorable low-poly canine sculptures for dog lovers.",
            fullDetails: "The perfect companion for your desk. Our low-poly dog collection captures the essence of different breeds in a clean, digital aesthetic.",
            specs: { material: "Premium PLA", dimensions: "120mm length", breed: "Choice of 5" },
            features: ["Clean sharp edges", "Vibrant colors", "Perfect for gifts"]
        },
        {
            id: '3-5', name: "Floating Planter", price: 1199,
            images: ["/images/products/art/planter-1.jpg", "/images/products/art/planter-2.jpg"],
            desc: "An eye-catching planter that seems to defy gravity.",
            fullDetails: "Using clever design and optional magnetic levitation, these planters bring a touch of the future to your indoor garden.",
            specs: { material: "Glass-filled PETG", dimensions: "100mm diameter", weight: "150g" },
            features: ["Innovative design", "Durable & Waterproof", "Conversation starter"]
        }
    ],
    4: [ // Miniatures
        {
            id: '4-1', name: "Warrior", price: 499,
            images: ["/images/products/miniatures/warrior-1.jpg", "/images/products/miniatures/warrior-2.jpg"],
            desc: "Ready for battle with detailed armor and weapons.",
            fullDetails: "The perfect hero for your next campaign. Our resin printing process captures every rivet, hair, and blade edge with microscopic accuracy.",
            specs: { material: "Tough Resin", scale: "32mm", base: "25mm included" },
            features: ["High painting detail", "Resilient material", "Ready for tabletop play"]
        },
        {
            id: '4-2', name: "Dragon", price: 899,
            images: ["/images/products/miniatures/dragon-1.jpg", "/images/products/miniatures/dragon-2.jpg"],
            desc: "A majestic creature with intricate scale details.",
            fullDetails: "A centerpiece for any collection. This multi-part dragon represents the pinnacle of large-scale resin printing.",
            specs: { material: "High-Speed Resin", scale: "Gargantuan (100mm)", parts: "5" },
            features: ["Individual scale detail", "Dynamic pose", "Easy-to-assemble joints"]
        },
        {
            id: '4-3', name: "Wizard", price: 499,
            images: ["/images/products/miniatures/wizard-1.jpg", "/images/products/miniatures/wizard-2.jpg"],
            desc: "Casting spells with a detailed staff and robes.",
            fullDetails: "Enchant your tabletop sessions. The flowing robes and mystical artifacts are rendered with exceptional clarity.",
            specs: { material: "Tough Resin", scale: "32mm", base: "25mm included" },
            features: ["Magic effect transparency", "Crisp details", "Perfect for hobby painting"]
        },
        {
            id: '4-4', name: "Sci-Fi Marine", price: 549,
            images: ["/images/products/miniatures/marine-1.jpg", "/images/products/miniatures/marine-2.jpg"],
            desc: "Futuristic soldier equipped for galactic adventures.",
            fullDetails: "From the depths of space, these marines are ready for any tactical simulation. Modular weapon options available upon request.",
            specs: { material: "Impact-Resistant Resin", scale: "35mm", weight: "18g" },
            features: ["Interchangeable parts", "Tactical gear detail", "No-cleanup print quality"]
        },
        {
            id: '4-5', name: "Orc Grunt", price: 449,
            images: ["/images/products/miniatures/orc-1.jpg", "/images/products/miniatures/orc-2.jpg"],
            desc: "The perfect addition to your fantasy tabletop army.",
            fullDetails: "Build your horde with ease. These orcs are designed for批量 printing while maintaining high standards of detail.",
            specs: { material: "Standard Resin", scale: "30mm", base: "Included" },
            features: ["Menacing expressions", "Ragged armor textures", "Cost-effective for armies"]
        }
    ],
    5: [ // Education
        {
            id: '5-1', name: "Gear Systems", price: 1599,
            images: ["/images/products/edu/gears-1.jpg", "/images/products/edu/gears-2.jpg"],
            desc: "Learn mechanical engineering with functioning 3D-printed gears.",
            fullDetails: "A practical introduction to mechanics. This set includes planetary, spur, and bevel gears that actually work together.",
            specs: { material: "Self-Lubricating Nylon", pieces: "12", educationalLevel: "Introductory" },
            features: ["Functioning rotation", "Clear assembly guide", "Study of gear ratios"]
        },
        {
            id: '5-2', name: "DNA Model", price: 1299,
            images: ["/images/products/edu/dna-1.jpg", "/images/products/edu/dna-2.jpg"],
            desc: "A visual, tactile representation of the building blocks of life.",
            fullDetails: "Explore the double helix in three dimensions. Each base pair is color-coded for easy learning and visualization.",
            specs: { material: "Matte PLA", height: "300mm", assemblyRequired: "Optional" },
            features: ["Accurate helical pitch", "Tactile learning aid", "Vibrant colors"]
        },
        {
            id: '5-3', name: "Solar System", price: 2499,
            images: ["/images/products/edu/solar-1.jpg", "/images/products/edu/solar-2.jpg"],
            desc: "Bring the cosmos to your classroom with this detailed scale model.",
            fullDetails: "A complete set of planets and the sun. While scales are adjusted for visibility, orbital relationships are clearly demonstrated.",
            specs: { material: "Glow-in-the-dark PLA", count: "9 pieces", base: "Not included" },
            features: ["Accurate planetary textures", "Glow-in-the-dark effects", "Educational data cards"]
        },
        {
            id: '5-4', name: "Bridge Building", price: 1899,
            images: ["/images/products/edu/bridge-1.jpg", "/images/products/edu/bridge-2.jpg"],
            desc: "Understand architecture and structural integrity by building your own.",
            fullDetails: "Test your engineering skills. This modular kit allows you to build different bridge types (truss, arch, suspension) and test their loads.",
            specs: { material: "Reinforced Composite", modules: "30+", maxLoad: "2kg" },
            features: ["Modular assembly", "Load-testing capability", "Structural focus"]
        },
        {
            id: '5-5', name: "Anatomy Set", price: 2199,
            images: ["/images/products/edu/anatomy-1.jpg", "/images/products/edu/anatomy-2.jpg"],
            desc: "Detailed 3D models of human bones for biological study.",
            fullDetails: "Medical-grade accuracy for the home learner. These scans of real human bones provide an unparalleled educational experience.",
            specs: { material: "Bone-white PLA", pieces: "Full Arm/Leg set", scale: "1:2" },
            features: ["Medical accuracy", "High surface fidelity", "Removable joint pins"]
        }
    ],
    6: [ // Photo Frames
        {
            id: '6-1', name: "Lithophane Box", price: 999,
            images: ["/images/products/frames/box-1.jpg", "/images/products/frames/box-2.jpg"],
            desc: "A magical light box that reveals your photo when switched on.",
            fullDetails: "The magic of light and depth. Simply slide your photo (we'll help you convert it) into the box and turn on the LED.",
            specs: { material: "Translucent Resin", dimensions: "100mm cube", power: "USB 5V" },
            features: ["Hidden photo effect", "Built-in LED lighting", "Sleek wooden frame option"]
        },
        {
            id: '6-2', name: "Curved Frame", price: 599,
            images: ["/images/products/frames/curved-1.jpg", "/images/products/frames/curved-2.jpg"],
            desc: "Modern curved design that makes your photos stand out.",
            fullDetails: "A frame that wraps around your memories. The elegant curvature adds a modern touch to traditional photo display.",
            specs: { material: "High-Gloss PLA", dimensions: "for 4x6 photos", orientation: "Vertical" },
            features: ["Reflective finish", "Stable base", "Easy photo insertion"]
        },
        {
            id: '6-3', name: "Heart Shape", price: 699,
            images: ["/images/products/frames/heart-1.jpg", "/images/products/frames/heart-2.jpg"],
            desc: "The perfect romantic gift for your loved ones.",
            fullDetails: "Express your love through 3D art. This heart-shaped frame is designed to highlight your most cherished romantic moments.",
            specs: { material: "Ruby Red PLA", dimensions: "150mm width", orientation: "Landscape" },
            features: ["Unique heart geometry", "Deep red color", "Standalone design"]
        },
        {
            id: '6-4', name: "Rotating Cube", price: 1299,
            images: ["/images/products/frames/cube-1.jpg", "/images/products/frames/cube-2.jpg"],
            desc: "Display six different photos in one rotating cube.",
            fullDetails: "Why settle for one photo? This precision-engineered cube allows Six photos to be displayed in a fun, interactive way.",
            specs: { material: "Matte Black PLA", dimensions: "120mm cube", mechanism: "Ball-bearing" },
            features: ["Smooth 360 rotation", "Six photo slots", "Industrial chic look"]
        },
        {
            id: '6-5', name: "Wall Mosaic", price: 1499,
            images: ["/images/products/frames/mosaic-1.jpg", "/images/products/frames/mosaic-2.jpg"],
            desc: "A large-scale mosaic frame for your most cherished memories.",
            fullDetails: "A grid of small photos forming a larger picture. This frame is designed to create a mosaic effect that captures multiple facets of a story.",
            specs: { material: "Lightweight Resin", units: "9 frames in 1", totalSize: "300x300mm" },
            features: ["Modular wall mounting", "Grid layout", "Modern art aesthetic"]
        }
    ]
};
