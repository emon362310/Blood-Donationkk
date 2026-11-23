import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiRequest } from '../../services/api';
import { PageTransition, StaggerGrid, StaggerCard, BloodDropLoader } from '../../components/ui/MotionPrimitives';
import type { BlogPost } from '../../types';

export const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');

  useEffect(() => {
    apiRequest<{ blogs: BlogPost[] }>('/api/blogs').then((res) => {
      if (res.success && res.data) setBlogs(res.data.blogs);
      setLoading(false);
    });
  }, []);

  const categories = Array.from(new Set(blogs.map((b) => b.category)));
  const filtered = cat ? blogs.filter((b) => b.category === cat) : blogs;

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="bg-gradient-to-r from-[#171316] via-[#7F1023] to-[#B5122A] rounded-2xl p-6 text-white">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">রক্তদান সচেতনতা ব্লগ</h1>
        <p className="text-xs sm:text-sm text-white/80 mt-1">স্বাস্থ্য, রক্তদান প্রস্তুতি ও বৈজ্ঞানিক তথ্য</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            !cat ? 'bg-[#B5122A] text-white' : 'bg-white border border-[#E7E1E3]'
          }`}
        >
          সব বিষয়
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
              cat === c ? 'bg-[#B5122A] text-white' : 'bg-white border border-[#E7E1E3]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <BloodDropLoader />
      ) : (
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <StaggerCard key={b.blog_id} className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden shadow-xs flex flex-col">
              <img src={b.thumbnail_url} alt={b.title} referrerPolicy="no-referrer" className="w-full h-44 object-cover bg-[#FCE4E8]" />
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#B5122A]">{b.category}</p>
                  <h2 className="font-display text-base font-bold text-[#241A1D] mt-1">{b.title}</h2>
                  <p className="text-xs text-[#75686C] mt-2 line-clamp-3">{b.content}</p>
                </div>
                <Link to={`/blog/${b.slug}`} className="text-xs font-semibold text-[#B5122A] hover:underline">
                  সম্পূর্ণ পড়ুন →
                </Link>
              </div>
            </StaggerCard>
          ))}
        </StaggerGrid>
      )}
    </PageTransition>
  );
};

export const BlogDetailsPage: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ blogs: BlogPost[] }>('/api/blogs').then((res) => {
      if (res.success && res.data) {
        setPost(res.data.blogs.find((b) => b.slug === slug) || null);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <BloodDropLoader />;
  if (!post) return <div className="p-12 text-center text-sm">প্রবন্ধ পাওয়া যায়নি।</div>;

  return (
    <PageTransition className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B5122A] hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>সব ব্লগে ফিরুন</span>
      </Link>
      <article className="bg-white border border-[#E7E1E3] rounded-2xl overflow-hidden shadow-sm">
        <img src={post.thumbnail_url} alt={post.title} referrerPolicy="no-referrer" className="w-full h-64 object-cover" />
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-[#B5122A]">{post.category}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171316]">{post.title}</h1>
          <div className="text-sm text-[#241A1D] leading-relaxed whitespace-pre-line">{post.content}</div>
        </div>
      </article>
    </PageTransition>
  );
};
