const { generateAIContent, analyzeMarketTrends } = require('../utils/aiContentGenerator');
const { postToSocialMedia } = require('../utils/socialMediaPoster');
const Course = require('../models/Course');

// Generate AI content for a course
exports.generateCourseContent = async (req, res) => {
  try {
    const { courseId, topic, level } = req.body;
    
    let course;
    if (courseId) {
      course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
    }
    
    const content = await generateAIContent(topic, level, course);
    
    res.json({ content });
  } catch (error) {
    console.error('Generate course content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Analyze market trends for course creation
exports.analyzeMarketTrends = async (req, res) => {
  try {
    const trends = await analyzeMarketTrends();
    
    res.json({ trends });
  } catch (error) {
    console.error('Analyze market trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post to social media
exports.postToSocialMedia = async (req, res) => {
  try {
    const { message, platforms, imageUrl } = req.body;
    
    const results = await postToSocialMedia(message, platforms, imageUrl);
    
    res.json({ results });
  } catch (error) {
    console.error('Post to social media error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate monthly course
exports.generateMonthlyCourse = async (req, res) => {
  try {
    // Analyze market trends to determine the best course topic
    const trends = await analyzeMarketTrends();
    
    // Get the most relevant trend
    const mainTrend = trends[0];
    
    // Generate course content based on the trend
    const courseContent = await generateAIContent(mainTrend.topic, 'Intermediate');
    
    // Create the new course
    const course = new Course({
      title: mainTrend.topic + ' Trading Strategies',
      description: `Learn how to trade ${mainTrend.topic} with proven strategies. This course covers everything from basics to advanced techniques.`,
      price: 799,
      level: 'Intermediate',
      content: courseContent,
      features: [
        'AI-generated content',
        'Market trend analysis',
        'Practical trading strategies',
        'Risk management techniques'
      ]
    });
    
    await course.save();
    
    // Post about the new course on social media
    await postToSocialMedia(
      `New course available: ${course.title}! Learn how to trade ${mainTrend.topic} with our AI-powered course.`,
      ['facebook', 'twitter', 'instagram', 'tiktok'],
      course.image
    );
    
    res.json({ course });
  } catch (error) {
    console.error('Generate monthly course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
