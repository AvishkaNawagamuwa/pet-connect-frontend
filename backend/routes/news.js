const express = require('express');
const router = express.Router();

// Mock news data
const mockNews = [
    {
        id: '1',
        title: 'New Pet Adoption Center Opens Downtown',
        summary: 'A state-of-the-art pet adoption facility has opened its doors, featuring modern amenities and spacious areas for pets.',
        content: 'The new downtown pet adoption center represents a significant step forward in animal welfare...',
        image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
        category: 'adoption',
        author: { name: 'Pet News Team', avatar: null },
        publishedAt: new Date('2024-01-15'),
        views: 1250,
        featured: true
    },
    {
        id: '2',
        title: 'Winter Pet Safety Tips',
        summary: 'Essential tips to keep your pets safe and comfortable during the cold winter months.',
        content: 'As temperatures drop, pet owners need to take extra precautions to ensure their furry friends stay safe...',
        image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400',
        category: 'health',
        author: { name: 'Dr. Sarah Johnson', avatar: null },
        publishedAt: new Date('2024-01-10'),
        views: 892,
        featured: false
    },
    {
        id: '3',
        title: 'Pet Technology Trends 2024',
        summary: 'Discover the latest technological innovations that are transforming pet care and ownership.',
        content: 'From smart collars to AI-powered health monitoring, technology is revolutionizing how we care for our pets...',
        image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400',
        category: 'technology',
        author: { name: 'Tech Pet Reporter', avatar: null },
        publishedAt: new Date('2024-01-08'),
        views: 1876,
        featured: true
    },
    {
        id: '4',
        title: 'Understanding Pet Nutrition',
        summary: 'A comprehensive guide to providing proper nutrition for different types of pets.',
        content: 'Proper nutrition is fundamental to your pet\'s health and longevity. This guide covers everything...',
        image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400',
        category: 'nutrition',
        author: { name: 'Pet Nutritionist', avatar: null },
        publishedAt: new Date('2024-01-05'),
        views: 634,
        featured: false
    },
    {
        id: '5',
        title: 'Community Pet Events This Month',
        summary: 'Don\'t miss these exciting pet-friendly events happening in your area this month.',
        content: 'Our community is hosting several amazing pet events this month, from adoption drives to training workshops...',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d0b?w=400',
        category: 'events',
        author: { name: 'Community Events', avatar: null },
        publishedAt: new Date('2024-01-03'),
        views: 2103,
        featured: false
    }
];

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
const getNews = (req, res) => {
    try {
        const { category, featured, page = 1, limit = 10 } = req.query;

        let filteredNews = [...mockNews];

        if (category) {
            filteredNews = filteredNews.filter(article => article.category === category);
        }

        if (featured === 'true') {
            filteredNews = filteredNews.filter(article => article.featured);
        }

        // Sort by publishedAt descending
        filteredNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        const total = filteredNews.length;
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedNews = filteredNews.slice(startIndex, endIndex);

        res.json({
            success: true,
            count: paginatedNews.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            articles: paginatedNews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching news'
        });
    }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
const getNewsArticle = (req, res) => {
    try {
        const article = mockNews.find(n => n.id === req.params.id);

        if (!article) {
            return res.status(404).json({
                success: false,
                message: 'Article not found'
            });
        }

        // Increment views
        article.views += 1;

        res.json({
            success: true,
            article
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching article'
        });
    }
};

// @desc    Get featured news articles
// @route   GET /api/news/featured
// @access  Public
const getFeaturedNews = (req, res) => {
    try {
        const featuredArticles = mockNews
            .filter(article => article.featured)
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .slice(0, 3);

        res.json({
            success: true,
            count: featuredArticles.length,
            articles: featuredArticles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching featured news'
        });
    }
};

// @desc    Get news categories
// @route   GET /api/news/categories
// @access  Public
const getNewsCategories = (req, res) => {
    try {
        const categories = [...new Set(mockNews.map(article => article.category))];

        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching categories'
        });
    }
};

// Routes
router.get('/featured', getFeaturedNews);
router.get('/categories', getNewsCategories);
router.get('/', getNews);
router.get('/:id', getNewsArticle);

module.exports = router;