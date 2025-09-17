const transporter = require('../config/email');
const Subscription = require('../models/Subscription');

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Apex Trade AI Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Welcome to Apex Trade AI Academy, ${name}!</h2>
          <p>We're excited to have you on board. Your journey to becoming a successful trader starts now.</p>
          <p>With our AI-powered courses, you'll learn:</p>
          <ul>
            <li>Market analysis techniques</li>
            <li>Risk management strategies</li>
            <li>Advanced trading methods</li>
            <li>And much more!</li>
          </ul>
          <p>Start exploring our courses and begin your trading education today.</p>
          <p>Happy trading!</p>
          <p><strong>The Apex Trade AI Team</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send purchase confirmation email
exports.sendPurchaseConfirmationEmail = async (email, name, courseTitle, amount) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Purchase Confirmation: ${courseTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">Thank you for your purchase, ${name}!</h2>
          <p>You've successfully purchased <strong>${courseTitle}</strong> for R${amount}.</p>
          <p>You can now access your course from your dashboard. Start learning immediately and take your trading skills to the next level.</p>
          <p>If you have any questions, don't hesitate to contact our support team.</p>
          <p>Happy learning!</p>
          <p><strong>The Apex Trade AI Team</strong></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending purchase confirmation email:', error);
  }
};

// Send contact form email
exports.sendContactEmail = async (contactData) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'info@apextradeai.co.za',
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3498db;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.firstName} ${contactData.lastName}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${contactData.message}</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending contact email:', error);
  }
};

// Send newsletter
exports.sendNewsletter = async (subject, content) => {
  try {
    const subscribers = await Subscription.find({ isActive: true });
    
    for (const subscriber of subscribers) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.email,
        subject: subject,
        html: content
      };

      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending newsletter:', error);
  }
};
