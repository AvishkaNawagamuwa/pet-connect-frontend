const express = require('express');
const { protect, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Mock data for posts
const mockPosts = [
    {
        id: '1',
        title: 'Lost Golden Retriever - Max',
        description: 'Max went missing from Central Park this morning. He is friendly and responds to his name.',
        type: 'lost',
        category: 'dogs',
        userId: 'user1',
        author: { name: 'John Doe', avatar: null },
        location: { address: 'Central Park, NY' },
        createdAt: new Date(),
        likes: [],
        comments: [],
        views: 0
    },
    {
        id: '2',
        title: 'Free Kitten to Good Home',
        description: 'Adorable 8-week-old kitten looking for a loving family. Fully weaned and litter trained.',
        type: 'adoption',
        category: 'cats',
        userId: 'user2',
        author: { name: 'Jane Smith', avatar: null },
        location: { address: 'Brooklyn, NY' },
        createdAt: new Date(),
        likes: [],
        comments: [],
        views: 0
    }
];

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getPosts = (req, res) => {
    try {
        const { type, category, search, page = 1, limit = 10 } = req.query;

        let filteredPosts = [...mockPosts];

        if (type) {
            filteredPosts = filteredPosts.filter(post => post.type === type);
        }

        if (category) {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        if (search) {
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(search.toLowerCase()) ||
                post.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        const total = filteredPosts.length;
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        res.json({
            success: true,
            count: paginatedPosts.length,
            total,
            pages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            posts: paginatedPosts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching posts'
        });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPost = (req, res) => {
    try {
        const post = mockPosts.find(p => p.id === req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        post.views += 1;

        res.json({
            success: true,
            post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching post'
        });
    }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
const createPost = (req, res) => {
    try {
        const newPost = {
            id: Date.now().toString(),
            ...req.body,
            userId: req.user.id,
            author: { name: req.user.name, avatar: req.user.avatar },
            createdAt: new Date(),
            likes: [],
            comments: [],
            views: 0
        };

        mockPosts.unshift(newPost);

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            post: newPost
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating post'
        });
    }
};

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes
router.use(protect);
router.post('/', createPost);

module.exports = router;