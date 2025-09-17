const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  rateCourse,
  getUserCourses
} = require('../controllers/courseController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', getCourses);
router.get('/:id', getCourse);
router.get('/user/mycourses', auth, getUserCourses);
router.post('/:id/rate', auth, rateCourse);

// Admin routes
router.post('/', auth, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), createCourse);
router.put('/:id', auth, admin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), updateCourse);
router.delete('/:id', auth, admin, deleteCourse);

module.exports = router;
