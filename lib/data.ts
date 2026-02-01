export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  description: string;
}

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
  },
  {
    id: '2',
    name: 'Pleated Wide Trousers',
    price: 180,
    category: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1632497775901-50ba4637399f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'High-waisted trousers with deep pleats and a wide leg silhouette. Tailored for movement.',
  },
  {
    id: '3',
    name: 'Oversized Wool Blazer',
    price: 350,
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1570653321586-3bb42aaee967?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'An oversized blazer crafted from premium wool blend. Features a notched lapel and single button closure.',
  },
  {
    id: '4',
    name: 'Asymmetric Midi Skirt',
    price: 150,
    category: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1570653321623-dc0d7941d9c5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Midi skirt with an asymmetric hemline and architectural draping.',
  },
  {
    id: '5',
    name: 'Minimalist Leather Boots',
    price: 280,
    category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1633636403566-bfe3862369fc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Sleek leather boots with a square toe and block heel.',
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
  },
  {
    id: '12',
    name: 'Platform Loafers',
    price: 210,
    category: 'Footwear',
    images: [
      'https://images.unsplash.com/photo-1764845069561-545c59e59799?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Chunky platform loafers with a polished leather finish.',
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
  },
  {
    id: '15',
    name: 'Denim Jacket',
    price: 160,
    category: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Vintage wash denim jacket with a relaxed fit.',
  },
  {
    id: '16',
    name: 'Linen Shorts',
    price: 90,
    category: 'Bottoms',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Breathable linen shorts with a drawstring waist.',
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
