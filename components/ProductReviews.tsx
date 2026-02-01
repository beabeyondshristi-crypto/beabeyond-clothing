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

  return (
    <section className="px-8 md:px-16 lg:px-24 py-20 border-t border-gray-100 bg-white">
      <div className="">
        <h2 className="text-2xl font-serif mb-12 uppercase tracking-widest">Reviews</h2>
        
        {/* Write a Review Section */}
        <div className="mb-16 max-w-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-xl transition-colors ${rating >= star ? 'text-black' : 'text-gray-300'}`}
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
                className="w-full bg-white border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
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
                className="w-full bg-white border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors"
                placeholder="Share your thoughts..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="space-y-10 max-w-2xl">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-10 last:border-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-sm uppercase tracking-wide">{review.author}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{review.date}</p>
                </div>
                <div className="flex text-black text-sm">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < review.rating ? 'text-black' : 'text-gray-200'}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed font-light">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
