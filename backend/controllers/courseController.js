const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const { level, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    if (level && level !== 'All') {
      query.level = level;
    }
    
    const courses = await Course.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Course.countDocuments(query);
    
    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single course
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('students', 'firstName lastName email');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create course (Admin only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, level, features, content } = req.body;
    
    let imageUrl = '';
    let videoUrl = '';
    
    // Upload image to Cloudinary if provided
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'apex-trade/courses'
      });
      imageUrl = result.secure_url;
    }
    
    // Upload video to Cloudinary if provided
    if (req.files && req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: 'video',
        folder: 'apex-trade/courses'
      });
      videoUrl = result.secure_url;
    }
    
    const course = new Course({
      title,
      description,
      price,
      level,
      image: imageUrl,
      video: videoUrl,
      features: JSON.parse(features),
      content: JSON.parse(content)
    });
    
    await course.save();
    
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update course (Admin only)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const { title, description, price, level, features, content } = req.body;
    
    // Upload new image to Cloudinary if provided
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: 'apex-trade/courses'
      });
      course.image = result.secure_url;
    }
    
    // Upload new video to Cloudinary if provided
    if (req.files && req.files.video) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: 'video',
        folder: 'apex-trade/courses'
      });
      course.video = result.secure_url;
    }
    
    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.level = level || course.level;
    
    if (features) course.features = JSON.parse(features);
    if (content) course.content = JSON.parse(content);
    
    await course.save();
    
    res.json(course);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete course (Admin only)
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    course.isActive = false;
    await course.save();
    
    res.json({ message: 'Course removed' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate course
exports.rateCourse = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user has purchased the course
    const purchase = await Purchase.findOne({
      user: req.user.id,
      course: req.params.id,
      status: 'completed'
    });
    
    if (!purchase) {
      return res.status(403).json({ message: 'You must purchase the course before rating it' });
    }
    
    // Check if user has already rated this course
    const alreadyRated = course.ratings.find(
      r => r.user.toString() === req.user.id.toString()
    );
    
    if (alreadyRated) {
      // Update existing rating
      alreadyRated.rating = rating;
      alreadyRated.comment = comment;
    } else {
      // Add new rating
      course.ratings.push({
        user: req.user.id,
        rating,
        comment
      });
    }
    
    // Update average rating
    course.updateAverageRating();
    
    await course.save();
    
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error('Rate course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's courses
exports.getUserCourses = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user: req.user.id,
      status: 'completed'
    }).populate('course');
    
    const courses = purchases.map(purchase => purchase.course);
    
    res.json(courses);
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
