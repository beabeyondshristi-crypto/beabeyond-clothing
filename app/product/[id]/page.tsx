import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { products } from '@/lib/data';
import ProductDetailsClient from '@/components/ProductDetailsClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <ProductDetailsClient product={product} />
    </div>
  );
}