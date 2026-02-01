# beabeyond-clothing

A minimalist, monochrome e-commerce template built with Next.js 16, TypeScript, and Tailwind CSS.

## Design Philosophy
- **Strictly Monochrome:** Black and white color palette.
- **Sharp Edges:** 0px border radius enforced globally.
- **Minimalist:** Clean lines, uppercase typography, focus on imagery.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

- `app/`: Next.js App Router pages.
  - `page.tsx`: Home page.
  - `shop/`: Product catalog.
  - `collections/`: Collections list.
  - `product/[id]/`: Product detail page.
- `components/`: Reusable UI components (Navbar, ProductCard).
- `lib/data.ts`: Mock product and collection data.
- `app/globals.css`: Global styles and Tailwind configuration.

## Customization

To modify the product data, edit `lib/data.ts`.
To change global styles, edit `app/globals.css`.