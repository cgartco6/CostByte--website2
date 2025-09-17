const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchase = require('../models/Purchase');
const Course = require('../models/Course');
const User = require('../models/User');
const { distributePayment } = require('../utils/paymentDistribution');
const { sendPurchaseConfirmationEmail } = require('../utils/emailService');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Convert to cents
      currency: 'zar',
      metadata: {
        courseId: courseId,
        userId: req.user.id
      }
    });
    
    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId, courseId } = req.body;
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }
    
    const course = await Course.findById(courseId);
    const user = await User.findById(req.user.id);
    
    // Create purchase record
    const purchase = new Purchase({
      user: req.user.id,
      course: courseId,
      amount: course.price,
      paymentMethod: 'card',
      status: 'completed',
      stripePaymentId: paymentIntentId,
      receiptUrl: paymentIntent.charges.data[0].receipt_url
    });
    
    await purchase.save();
    
    // Add course to user's courses
    user.courses.push(courseId);
    await user.save();
    
    // Add user to course's students
    course.students.push(req.user.id);
    course.totalSales += 1;
    course.revenue += course.price;
    await course.save();
    
    // Distribute payment according to the specified percentages
    await distributePayment(course.price, course.title);
    
    // Send purchase confirmation email
    await sendPurchaseConfirmationEmail(user.email, user.firstName, course.title, course.price);
    
    res.json({ 
      message: 'Payment confirmed successfully',
      purchase 
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's purchases
exports.getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ user: req.user.id })
      .populate('course', 'title image price')
      .sort({ createdAt: -1 });
    
    res.json(purchases);
  } catch (error) {
    console.error('Get user purchases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Webhook for Stripe events
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Here you can update your database based on the successful payment
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      console.log('PaymentMethod was attached to a Customer:', paymentMethod.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
