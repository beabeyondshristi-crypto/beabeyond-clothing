export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Dresses' | 'Tops' | 'Jeans' | 'Skirts' | 'Co-ord Sets' | string;
  images: string[];
  description: string;
  colors: string[];
  fabric: string;
  sizes: string[];
  isNewArrival?: boolean;
  isTrending?: boolean;
  isEssential?: boolean;
}

const DEFAULT_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const products: Product[] = [
  {
    id: '1',
    name: 'Structured Cotton Shirt',
    price: 120,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1618333453613-2ccb4967e610?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'A crisp, structured cotton shirt with a boxy fit. Sharp lines and minimal detailing.',
    colors: ['White', 'Black', 'Grey'],
    fabric: '100% Cotton',
    sizes: DEFAULT_SIZES,
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: '2',
    name: 'Pleated Wide Trousers',
    price: 180,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1632497775901-50ba4637399f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High-waisted trousers with deep pleats and a wide leg silhouette. Tailored for movement.',
    colors: ['Black', 'Navy', 'Charcoal'],
    fabric: 'Wool Blend',
    sizes: DEFAULT_SIZES,
    isNewArrival: true,
    isEssential: true,
  },
  {
    id: '3',
    name: 'Oversized Wool Blazer',
    price: 350,
    category: 'Co-ord Sets',
    images: [
      'https://images.unsplash.com/photo-1570653321586-3bb42aaee967?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'An oversized blazer crafted from premium wool blend. Features a notched lapel and single button closure.',
    colors: ['Grey', 'Black'],
    fabric: 'Premium Wool',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '4',
    name: 'Asymmetric Midi Skirt',
    price: 150,
    category: 'Skirts',
    images: [
      'https://images.unsplash.com/photo-1570653321623-dc0d7941d9c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Midi skirt with an asymmetric hemline and architectural draping.',
    colors: ['Black', 'Off-White'],
    fabric: 'Crepe',
    sizes: DEFAULT_SIZES,
    isNewArrival: true,
  },
  {
    id: '5',
    name: 'Minimalist Leather Boots',
    price: 280,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1633636403566-bfe3862369fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sleek leather boots with a square toe and block heel.',
    colors: ['Black', 'Brown'],
    fabric: 'Genuine Leather',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '6',
    name: 'Canvas Tote Bag',
    price: 85,
    category: 'Accessories',
    images: [
      'https://plus.unsplash.com/premium_photo-1670573801174-1ab41ec2afa0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874102752-ede7f3eb6885?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Durable canvas tote with reinforced handles and interior pocket.',
    colors: ['Beige', 'Black', 'Olive'],
    fabric: 'Organic Canvas',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '7',
    name: 'Cropped Knit Sweater',
    price: 110,
    category: 'Tops',
    images: [
      'https://plus.unsplash.com/premium_photo-1688497830977-f9ab9f958ca7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Heavy knit sweater with a cropped length and dropped shoulders.',
    colors: ['Black', 'Cream', 'Grey'],
    fabric: 'Knit Cotton',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '8',
    name: 'Tailored Vest',
    price: 130,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1765306552441-cd32bb216b0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Fitted vest with a deep V-neck and adjustable back strap.',
    colors: ['Black', 'Pinstripe'],
    fabric: 'Polyester Blend',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '9',
    name: 'Silk Slip Dress',
    price: 220,
    category: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Bias-cut silk slip dress in jet black. Minimalist evening wear.',
    colors: ['Black', 'Midnight Blue', 'Champagne'],
    fabric: '100% Silk',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '10',
    name: 'Leather Crossbody',
    price: 195,
    category: 'Accessories',
    images: [
      'https://plus.unsplash.com/premium_photo-1670573800532-a861ffeca229?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Compact leather bag with sharp geometric lines and silver hardware.',
    colors: ['Black', 'Tan', 'Burgundy'],
    fabric: 'Genuine Leather',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '11',
    name: 'Cashmere Scarf',
    price: 95,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1570653321841-462dd6268561?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Oversized cashmere blend scarf. Soft, warm, and essential.',
    colors: ['Grey', 'Camel', 'Black'],
    fabric: 'Cashmere Blend',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '12',
    name: 'Platform Loafers',
    price: 210,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1764845069561-545c59e59799?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Chunky platform loafers with a polished leather finish.',
    colors: ['Black', 'Oxblood'],
    fabric: 'Genuine Leather',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '13',
    name: 'Ribbed Tank Top',
    price: 60,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Essential ribbed tank top in organic cotton. Fitted silhouette.',
    colors: ['White', 'Black', 'Heather Grey'],
    fabric: 'Organic Cotton',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '14',
    name: 'Wide Brim Hat',
    price: 85,
    category: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Classic wide brim hat made from woven straw.',
    colors: ['Beige', 'Natural'],
    fabric: 'Woven Straw',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '15',
    name: 'Denim Jacket',
    price: 160,
    category: 'Jeans',
    images: [
      'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Vintage wash denim jacket with a relaxed fit.',
    colors: ['Light Blue', 'Dark Indigo', 'Black'],
    fabric: 'Denim Cotton',
    sizes: DEFAULT_SIZES,
    isNewArrival: true,
  },
  {
    id: '16',
    name: 'Linen Shorts',
    price: 90,
    category: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Breathable linen shorts with a drawstring waist.',
    colors: ['White', 'Sand', 'Sage'],
    fabric: '100% Linen',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '17',
    name: 'Silk Georgette Blouse',
    price: 175,
    category: 'Tops',
    images: [
       'https://images.unsplash.com/photo-1605763240004-7e93b172d754?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1551163943-3f6a29e3945f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sheer silk georgette blouse with a tie neck detail.',
    colors: ['Black', 'Ivory'],
    fabric: 'Silk Georgette',
    sizes: DEFAULT_SIZES,
    isNewArrival: true,
  },
  {
    id: '18',
    name: 'Cigarette Trousers',
    price: 140,
    category: 'Tops',
    images: [
       'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Slim fit cigarette trousers in black wool crepe.',
    colors: ['Black', 'Navy'],
    fabric: 'Wool Crepe',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '19',
    name: 'Sculptural Gold Earrings',
    price: 120,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1630019852942-f89202989a51?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Abstract gold-plated earrings with a matte finish.',
    colors: ['Gold', 'Silver'],
    fabric: 'Gold Plated Brass',
    sizes: ['OS'],
    isTrending: true,
  },
  {
    id: '20',
    name: 'Minimalist Watch',
    price: 250,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Unisex watch with a white face and black leather strap.',
    colors: ['Black/White', 'All Black', 'Tan/Silver'],
    fabric: 'Stainless Steel / Leather',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '21',
    name: 'Basic White Tee',
    price: 45,
    category: 'Tops',
    images: [
       'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Premium heavyweight cotton t-shirt. The perfect staple.',
    colors: ['White', 'Off-White'],
    fabric: '100% Cotton',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '22',
    name: 'Leather Belt',
    price: 75,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Full grain leather belt with a custom silver buckle.',
    colors: ['Black', 'Dark Brown'],
    fabric: 'Full Grain Leather',
    sizes: ['S', 'M', 'L'],
    isEssential: true,
  },
  {
    id: '23',
    name: 'Wrap Coat',
    price: 420,
    category: 'Co-ord Sets',
    images: [
       'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Luxurious camel wool wrap coat with a tie waist.',
    colors: ['Camel', 'Black', 'Grey'],
    fabric: '100% Camel Wool',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '24',
    name: 'Satin Midi Skirt',
    price: 135,
    category: 'Skirts',
    images: [
       'https://images.unsplash.com/photo-1582142327305-1811d4319ac6?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1582142839970-2b9e04b60f65?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Fluid satin midi skirt in champagne color.',
    colors: ['Champagne', 'Silver', 'Black'],
    fabric: 'Satin',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '25',
    name: 'Cat Eye Sunglasses',
    price: 165,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Sharp cat-eye silhouette sunglasses in acetate.',
    colors: ['Tortoise', 'Black'],
    fabric: 'Acetate',
    sizes: ['OS'],
    isTrending: true,
  },
  {
    id: '26',
    name: 'Canvas Sneakers',
    price: 85,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Low top canvas sneakers in off-white.',
    colors: ['Off-White', 'Black'],
    fabric: 'Canvas / Rubber',
    sizes: DEFAULT_SIZES,
    isEssential: true,
  },
  {
    id: '27',
    name: 'Leather Cardholder',
    price: 55,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1627123424574-18bd75f72680?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1606503825008-909a6184aeb6?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Minimalist leather cardholder with 4 slots.',
    colors: ['Black', 'Tan', 'Navy'],
    fabric: 'Genuine Leather',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '28',
    name: 'Puffer Jacket',
    price: 290,
    category: 'Co-ord Sets',
    images: [
       'https://images.unsplash.com/photo-1545931847-51d94569e8cd?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Oversized puffer jacket with high collar.',
    colors: ['Black', 'Red', 'Olive'],
    fabric: 'Nylon / Down Fill',
    sizes: DEFAULT_SIZES,
    isTrending: true,
  },
  {
    id: '29',
    name: 'Cotton Socks Set',
    price: 35,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1606522510344-42cb41264c23?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Pack of 3 ribbed cotton socks in neutral tones.',
    colors: ['Multi', 'Monochrome'],
    fabric: 'Organic Cotton Blend',
    sizes: ['OS'],
    isEssential: true,
  },
  {
    id: '30',
    name: 'Evening Clutch',
    price: 180,
    category: 'Accessories',
    images: [
       'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
       'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Velvet evening clutch with gold clasp.',
    colors: ['Emerald', 'Black', 'Ruby'],
    fabric: 'Velvet',
    sizes: ['OS'],
    isTrending: true,
  }
];

export const collections = [
  { 
    name: 'New Arrivals', 
    slug: 'new-arrivals', 
    image: 'https://images.unsplash.com/photo-1760512901586-f70030a53cd1?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    name: 'Essentials', 
    slug: 'essentials', 
    image: 'https://images.unsplash.com/photo-1632497775897-815042a13216?auto=format&fit=crop&w=800&q=80' 
  },
  { 
    name: 'Accessories', 
    slug: 'accessories', 
    image: 'https://images.unsplash.com/photo-1618333453613-2ccb4967e610?auto=format&fit=crop&w=800&q=80' 
  },
];
