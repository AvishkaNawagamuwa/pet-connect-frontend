const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    getMe,
    updateProfile,
    addPet,
    updatePet,
    deletePet,
    changePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('role')
        .optional()
        .isIn(['owner', 'veterinarian', 'shelter'])
        .withMessage('Role must be owner, veterinarian, or shelter')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number')
];

const petValidation = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Pet name must be between 1 and 30 characters'),
    body('type')
        .isIn(['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'guinea pig', 'reptile', 'other'])
        .withMessage('Invalid pet type'),
    body('breed')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Breed must be less than 50 characters'),
    body('age')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Age must be between 0 and 50'),
    body('weight')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Weight must be a positive number'),
    body('gender')
        .optional()
        .isIn(['male', 'female', 'unknown'])
        .withMessage('Gender must be male, female, or unknown')
];

const passwordChangeValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', [
    body('email').isEmail().withMessage('Please provide a valid email')
], forgotPassword);
router.put('/reset-password/:resettoken', [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], resetPassword);

// Protected routes
router.use(protect); // All routes below require authentication

router.get('/me', getMe);
router.put('/me', updateProfileValidation, updateProfile);
router.put('/password', passwordChangeValidation, changePassword);

// Pet management routes
router.post('/pets', petValidation, addPet);
router.put('/pets/:petId', petValidation, updatePet);
router.delete('/pets/:petId', deletePet);

module.exports = router;