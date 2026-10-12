'use client';

import { useState } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Alex M.',
    rating: 5,
    date: 'October 12, 2023',
    content: 'Absolutely love the quality. The fit is perfect and exactly as described.'
  },
  {
    id: '2',
    author: 'Sarah J.',
    rating: 4,
    date: 'September 28, 2023',
    content: 'Great material, but shipping took a little longer than expected. Worth the wait though!'
  },
  {
    id: '3',
    author: 'David K.',
    rating: 5,
    date: 'August 15, 2023',
    content: 'Minimalist perfection. Will definitely be buying more from this collection.'
  }
];

export default function ProductReviews() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      const newReview: Review = {
        id: Date.now().toString(),
        author,
        rating,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        content,
      };

      setReviews([newReview, ...reviews]);
      setAuthor('');
      setContent('');
      setRating(5);
      setIsSubmitting(false);
    }, 800);
  };

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);

  return (
    <section className="px-6 md:px-12 py-20 border-t border-black bg-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 pb-10 border-b border-black">
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">What Clients Say</span>
          <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">Reviews</h2>
        </div>
        <div className="flex items-end gap-5">
          <span className="font-serif text-6xl leading-none tabular-nums">{average.toFixed(1)}</span>
          <div className="pb-1">
            <div className="flex text-sm" aria-label={`${average.toFixed(1)} out of 5`}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(average) ? 'text-black' : 'text-gray-200'}>★</span>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] mt-1">{reviews.length} Reviews</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
        {/* Reviews List */}
        <div className="lg:col-span-7 space-y-10">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-black/10 pb-10 last:border-0 reveal">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{review.author}</p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{review.date} · Verified Buyer</p>
                </div>
                <div className="flex text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-black' : 'text-gray-200'}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-light">{review.content}</p>
            </div>
          ))}
        </div>

        {/* Write a Review Section */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 border border-black p-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8">Write a Review</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`${star} star${star > 1 ? 's' : ''}`}
                      className={`text-xl transition-colors ${rating >= star ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="author" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white border-b border-black py-3 text-sm focus:outline-none"
                  placeholder="Your Name"
                  required
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Review</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-black/20 p-3 text-sm focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white border border-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
