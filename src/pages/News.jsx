import React, { useState } from 'react';
import { Calendar, User, Heart, MessageCircle, Share2, Search, Filter, Clock, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import bgPattern from '../assets/bgw&b.png';

const News = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [likedArticles, setLikedArticles] = useState(new Set());

    // Mock news data
    const [newsArticles] = useState([
        {
            id: 1,
            title: "Revolutionary Pet Health Monitoring App Launches Globally",
            summary: "A new AI-powered application helps pet owners monitor their furry friends' health in real-time, providing early warning signs for potential health issues.",
            content: "The pet care industry has taken a significant leap forward with the launch of PetHealth AI, a groundbreaking application that uses artificial intelligence to monitor pet health in real-time. The app analyzes various data points including activity levels, eating patterns, and behavioral changes to provide early warnings for potential health issues. This innovative technology promises to revolutionize how we care for our beloved pets, potentially saving thousands of lives through early detection and intervention.",
            author: "Dr. Sarah Johnson",
            authorRole: "Veterinary Specialist",
            date: "2025-09-28",
            readTime: "5 min read",
            category: "Technology",
            image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            tags: ["AI", "Health Monitoring", "Innovation"],
            likes: 245,
            comments: 18
        },
        {
            id: 2,
            title: "Local Animal Shelter Achieves 95% Adoption Rate",
            summary: "Sunny Paws Shelter implements innovative adoption programs and community outreach, resulting in record-breaking adoption statistics.",
            content: "Sunny Paws Animal Shelter has achieved an unprecedented 95% adoption rate through their innovative community programs and modern approach to pet adoption. The shelter introduced virtual reality experiences allowing potential adopters to interact with pets remotely, comprehensive behavioral assessments, and post-adoption support programs. Their success story serves as a model for shelters worldwide, proving that creative approaches and community engagement can dramatically improve outcomes for homeless pets.",
            author: "Maria Rodriguez",
            authorRole: "Animal Welfare Advocate",
            date: "2025-09-27",
            readTime: "4 min read",
            category: "Community",
            image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            tags: ["Adoption", "Community", "Success Story"],
            likes: 189,
            comments: 32
        },
        {
            id: 3,
            title: "New Study Reveals Benefits of Pet Therapy in Hospitals",
            summary: "Research shows that pet therapy programs significantly improve patient recovery times and mental health outcomes in medical facilities.",
            content: "A comprehensive study conducted across 50 hospitals reveals that pet therapy programs have measurable positive effects on patient recovery. The research, spanning two years, found that patients who participated in pet therapy sessions showed 40% faster recovery times, reduced anxiety levels, and improved overall satisfaction with their hospital experience. These findings are encouraging more medical facilities to incorporate certified therapy animals into their treatment programs, creating new opportunities for specially trained pets to serve their communities.",
            author: "Dr. Michael Chen",
            authorRole: "Medical Researcher",
            date: "2025-09-26",
            readTime: "6 min read",
            category: "Health",
            image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80",
            tags: ["Therapy", "Healthcare", "Research"],
            likes: 167,
            comments: 25
        },
        {
            id: 4,
            title: "Sustainable Pet Food Initiative Gains Momentum Worldwide",
            summary: "Major pet food manufacturers commit to environmentally friendly practices, reducing carbon footprint while maintaining nutritional quality.",
            content: "The pet food industry is undergoing a green revolution as major manufacturers commit to sustainable practices. Leading companies have announced initiatives to reduce packaging waste by 75%, source ingredients from regenerative farms, and implement carbon-neutral manufacturing processes. This shift toward sustainability addresses growing consumer demand for environmentally responsible pet products while ensuring pets continue to receive optimal nutrition. The initiative is expected to significantly reduce the industry's environmental impact over the next decade.",
            author: "Emma Thompson",
            authorRole: "Environmental Journalist",
            date: "2025-09-25",
            readTime: "7 min read",
            category: "Environment",
            image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
            tags: ["Sustainability", "Environment", "Pet Food"],
            likes: 134,
            comments: 19
        },
        {
            id: 5,
            title: "Breakthrough in Canine Cancer Treatment Shows Promise",
            summary: "New immunotherapy treatment demonstrates remarkable success in clinical trials, offering hope for dogs diagnosed with cancer.",
            content: "Veterinary oncologists have achieved a significant breakthrough with a new immunotherapy treatment for canine cancer. Clinical trials show an 85% success rate in treating various forms of cancer in dogs, with many patients achieving complete remission. This innovative treatment harnesses the dog's own immune system to fight cancer cells, resulting in fewer side effects compared to traditional chemotherapy. The treatment is expected to be widely available within the next year, potentially saving thousands of canine lives and serving as a foundation for similar treatments in other animals.",
            author: "Dr. Lisa Park",
            authorRole: "Veterinary Oncologist",
            date: "2025-09-24",
            readTime: "8 min read",
            category: "Health",
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2062&q=80",
            tags: ["Cancer Treatment", "Medical Breakthrough", "Research"],
            likes: 298,
            comments: 47
        },
        {
            id: 6,
            title: "Smart Collar Technology Helps Reunite Lost Pets with Families",
            summary: "Advanced GPS and communication technology in smart collars increases lost pet recovery rates by 300% in major cities.",
            content: "The latest advancement in pet safety technology has arrived with the introduction of smart collars featuring GPS tracking, health monitoring, and two-way communication capabilities. These innovative devices have increased lost pet recovery rates by an astounding 300% in cities where they've been deployed. The collars provide real-time location tracking, can detect unusual behavior patterns that might indicate distress, and even allow owners to communicate with their pets remotely. This technology represents a significant step forward in pet safety and peace of mind for pet owners worldwide.",
            author: "Tech Reporter",
            authorRole: "Technology Correspondent",
            date: "2025-09-23",
            readTime: "5 min read",
            category: "Technology",
            image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2088&q=80",
            tags: ["GPS", "Smart Technology", "Pet Safety"],
            likes: 176,
            comments: 23
        }
    ]);

    const categories = ['all', 'Technology', 'Health', 'Community', 'Environment'];

    const filteredArticles = newsArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleLike = (articleId) => {
        setLikedArticles(prev => {
            const newLiked = new Set(prev);
            if (newLiked.has(articleId)) {
                newLiked.delete(articleId);
            } else {
                newLiked.add(articleId);
            }
            return newLiked;
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            Technology: 'bg-blue-100 text-blue-800',
            Health: 'bg-green-100 text-green-800',
            Community: 'bg-purple-100 text-purple-800',
            Environment: 'bg-emerald-100 text-emerald-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Navigation />
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 pt-24 pb-12">
                {/* Background Pattern */}
                <div
                    aria-hidden="true"
                    style={{
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.02), rgba(0,0,0,0.02)), url(${bgPattern})`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "400px 400px",
                        opacity: 0.3,
                        pointerEvents: "none",
                        position: "fixed",
                        inset: 0,
                        zIndex: -1,
                    }}
                />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold text-gray-800 mb-4">
                            🐾 Pet Connect News
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Stay updated with the latest news, breakthroughs, and stories from the pet care world
                        </p>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Search Bar */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search news articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="flex items-center gap-2">
                                <Filter size={20} className="text-gray-500" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category === 'all' ? 'All Categories' : category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Featured Article */}
                    {filteredArticles.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <TrendingUp className="mr-2 text-orange-600" />
                                Featured Story
                            </h2>
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-100">
                                <div className="lg:flex">
                                    <div className="lg:w-1/2">
                                        <img
                                            src={filteredArticles[0].image}
                                            alt={filteredArticles[0].title}
                                            className="w-full h-64 lg:h-full object-cover"
                                        />
                                    </div>
                                    <div className="lg:w-1/2 p-8">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(filteredArticles[0].category)}`}>
                                                {filteredArticles[0].category}
                                            </span>
                                            <span className="text-gray-500 text-sm flex items-center">
                                                <Clock size={16} className="mr-1" />
                                                {filteredArticles[0].readTime}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                            {filteredArticles[0].title}
                                        </h3>
                                        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                            {filteredArticles[0].summary}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <User size={16} className="mr-2" />
                                                <span>{filteredArticles[0].author}</span>
                                                <span className="mx-2">•</span>
                                                <Calendar size={16} className="mr-1" />
                                                <span>{new Date(filteredArticles[0].date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => handleLike(filteredArticles[0].id)}
                                                    className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${likedArticles.has(filteredArticles[0].id)
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
                                                        }`}
                                                >
                                                    <Heart size={16} className={likedArticles.has(filteredArticles[0].id) ? 'fill-current' : ''} />
                                                    <span>{filteredArticles[0].likes + (likedArticles.has(filteredArticles[0].id) ? 1 : 0)}</span>
                                                </button>
                                                <button className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                    <MessageCircle size={16} />
                                                    <span>{filteredArticles[0].comments}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.slice(1).map((article) => (
                            <div key={article.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                            {article.category}
                                        </span>
                                        <span className="text-gray-500 text-xs flex items-center">
                                            <Clock size={12} className="mr-1" />
                                            {article.readTime}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                                        {article.title}
                                    </h3>

                                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                                        {article.summary}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                        <div className="flex items-center">
                                            <User size={12} className="mr-1" />
                                            <span>{article.author}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar size={12} className="mr-1" />
                                            <span>{new Date(article.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleLike(article.id)}
                                                className={`flex items-center gap-1 text-sm transition-colors ${likedArticles.has(article.id)
                                                        ? 'text-red-600'
                                                        : 'text-gray-500 hover:text-red-500'
                                                    }`}
                                            >
                                                <Heart size={14} className={likedArticles.has(article.id) ? 'fill-current' : ''} />
                                                <span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                                            </button>

                                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                                                <MessageCircle size={14} />
                                                <span>{article.comments}</span>
                                            </button>

                                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors">
                                                <Share2 size={14} />
                                                <span>Share</span>
                                            </button>
                                        </div>

                                        <button className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                                            Read More →
                                        </button>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {article.tags.map((tag, index) => (
                                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredArticles.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-600 mb-2">No articles found</h3>
                            <p className="text-gray-500">Try adjusting your search terms or category filter</p>
                        </div>
                    )}

                    {/* Load More Button */}
                    {filteredArticles.length > 0 && (
                        <div className="text-center mt-12">
                            <button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                                Load More Articles
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default News;