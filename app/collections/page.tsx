import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { collections } from '@/lib/data';

export default function Collections() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="border-b border-black py-16 px-6 md:px-12">
            <h1 className="text-6xl font-bold uppercase tracking-tighter">Collections</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-black">
          {collections.map((collection, index) => (
            <Link 
                href={`/collections/${collection.slug}`} 
                key={collection.slug}
                className={`group block relative aspect-[3/4] border-b md:border-b-0 ${index !== collections.length - 1 ? 'md:border-r border-black' : ''} overflow-hidden`}
            >
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-white bg-black px-6 py-2">
                        {collection.name}
                    </h2>
                </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
