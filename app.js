const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
const SendGridService = require('./src/services/sendgridService');
const Database = require('./src/database/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize email service and database
const emailService = new SendGridService();
const database = new Database();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes

// Original appointment booking route
app.post('/book', async (req, res) => {
  const { name, email } = req.body;

  const msg = {
    to: email,
    from: process.env.FROM_EMAIL,
    subject: 'Appointment Confirmed',
    text: `Thank you, ${name}, for booking your appointment!`,
    html: `<strong>Thank you, ${name}, for booking your appointment!</strong>`,
  };

  try {
    await sgMail.send(msg);
    
    // Log the email
    let customer = await database.getCustomerByEmail(email);
    if (!customer) {
      customer = await database.addCustomer(name, email);
    }
    await database.logEmail(customer.id, 'appointment', email, name, 'Appointment Confirmed');
    
    res.send(`<h2>Thank you, ${name}. A confirmation email has been sent to ${email}.</h2>`);
  } catch (error) {
    console.error(error);
    
    // Log the failed email
    try {
      let customer = await database.getCustomerByEmail(email);
      if (!customer) {
        customer = await database.addCustomer(name, email);
      }
      await database.logEmail(customer.id, 'appointment', email, name, 'Appointment Confirmed', 'failed', error.message);
    } catch (logError) {
      console.error('Error logging failed email:', logError);
    }
    
    res.status(500).send('Something went wrong.');
  }
});

// New comprehensive email routes

// Registration email
app.post('/api/email/registration', async (req, res) => {
  try {
    const { username, emailid, usercode, testType } = req.body;
    
    if (!username || !emailid || !usercode || !testType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, emailid, usercode, testType' 
      });
    }

    const result = await emailService.sendRegistrationEmail({
      username,
      emailid,
      usercode
    }, testType);

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(emailid);
      if (!customer) {
        customer = await database.addCustomer(username, emailid);
      }
      await database.logEmail(
        customer.id, 
        'registration', 
        emailid, 
        username, 
        `Welcome to ${testType} Test - Registration Confirmed`,
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('Registration email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test start email
app.post('/api/email/test-start', async (req, res) => {
  try {
    const { username, emailid, startUrl, resumeUrl, testType } = req.body;
    
    if (!username || !emailid || !startUrl || !resumeUrl || !testType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, emailid, startUrl, resumeUrl, testType' 
      });
    }

    const result = await emailService.sendTestStartEmail({
      username,
      emailid
    }, startUrl, resumeUrl, testType);

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(emailid);
      if (!customer) {
        customer = await database.addCustomer(username, emailid);
      }
      await database.logEmail(
        customer.id, 
        'test-start', 
        emailid, 
        username, 
        `Your ${testType} Test is Ready to Begin`,
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('Test start email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test completion email
app.post('/api/email/test-completion', async (req, res) => {
  try {
    const { username, emailid, reportUrl, testType } = req.body;
    
    if (!username || !emailid || !reportUrl || !testType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, emailid, reportUrl, testType' 
      });
    }

    const result = await emailService.sendTestCompletionEmail({
      username,
      emailid
    }, reportUrl, testType);

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(emailid);
      if (!customer) {
        customer = await database.addCustomer(username, emailid);
      }
      await database.logEmail(
        customer.id, 
        'test-completion', 
        emailid, 
        username, 
        `Your ${testType} Test Results are Ready`,
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('Test completion email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// DMIT scans collected email
app.post('/api/email/dmit-scans', async (req, res) => {
  try {
    const { username, emailid } = req.body;
    
    if (!username || !emailid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, emailid' 
      });
    }

    const result = await emailService.sendDMITScansCollectedEmail({
      username,
      emailid
    });

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(emailid);
      if (!customer) {
        customer = await database.addCustomer(username, emailid);
      }
      await database.logEmail(
        customer.id, 
        'dmit-scans', 
        emailid, 
        username, 
        'DMIT Scans Successfully Collected',
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('DMIT scans email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Counseling session email
app.post('/api/email/counseling', async (req, res) => {
  try {
    const { username, emailid, action, sessionDetails } = req.body;
    
    if (!username || !emailid || !action || !sessionDetails) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: username, emailid, action, sessionDetails' 
      });
    }

    const result = await emailService.sendCounselingSessionEmail({
      username,
      emailid
    }, action, sessionDetails);

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(emailid);
      if (!customer) {
        customer = await database.addCustomer(username, emailid);
      }
      const subject = `${action.charAt(0).toUpperCase() + action.slice(1)} Counseling Session`;
      await database.logEmail(
        customer.id, 
        'counseling', 
        emailid, 
        username, 
        subject,
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('Counseling session email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Admin routes

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(__dirname + '/public/admin.html');
});

// Send manual email (admin)
app.post('/api/admin/send-email', async (req, res) => {
  try {
    const { displayName, recipientEmail, emailType, ...templateFields } = req.body;
    
    if (!displayName || !recipientEmail || !emailType) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: displayName, recipientEmail, emailType' 
      });
    }

    let result;
    const userData = { username: displayName, emailid: recipientEmail };

    switch (emailType) {
      case 'registration':
        if (!templateFields.usercode || !templateFields.testType) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: usercode, testType' 
          });
        }
        result = await emailService.sendRegistrationEmail({
          ...userData,
          usercode: templateFields.usercode
        }, templateFields.testType);
        break;

      case 'test-start':
        if (!templateFields.startUrl || !templateFields.resumeUrl || !templateFields.testType) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: startUrl, resumeUrl, testType' 
          });
        }
        result = await emailService.sendTestStartEmail(userData, templateFields.startUrl, templateFields.resumeUrl, templateFields.testType);
        break;

      case 'test-completion':
        if (!templateFields.reportUrl || !templateFields.testType) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: reportUrl, testType' 
          });
        }
        result = await emailService.sendTestCompletionEmail(userData, templateFields.reportUrl, templateFields.testType);
        break;

      case 'dmit-scans':
        result = await emailService.sendDMITScansCollectedEmail(userData);
        break;

      case 'counseling':
        if (!templateFields.action || !templateFields.sessionDate || !templateFields.sessionTime || !templateFields.counselor || !templateFields.meetingLink) {
          return res.status(400).json({ 
            success: false, 
            message: 'Missing required fields: action, sessionDate, sessionTime, counselor, meetingLink' 
          });
        }
        result = await emailService.sendCounselingSessionEmail(userData, templateFields.action, {
          date: templateFields.sessionDate,
          time: templateFields.sessionTime,
          counselor: templateFields.counselor,
          meetingLink: templateFields.meetingLink
        });
        break;

      case 'appointment':
        const msg = {
          to: recipientEmail,
          from: process.env.FROM_EMAIL,
          subject: 'Appointment Confirmed',
          text: `Thank you, ${displayName}, for booking your appointment!`,
          html: `<strong>Thank you, ${displayName}, for booking your appointment!</strong>`,
        };
        await sgMail.send(msg);
        result = { success: true, message: 'Appointment email sent successfully' };
        break;

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email type' 
        });
    }

    // Log the email
    try {
      let customer = await database.getCustomerByEmail(recipientEmail);
      if (!customer) {
        customer = await database.addCustomer(displayName, recipientEmail);
      }
      
      let subject = '';
      switch (emailType) {
        case 'registration': subject = `Welcome to ${templateFields.testType} Test - Registration Confirmed`; break;
        case 'test-start': subject = `Your ${templateFields.testType} Test is Ready to Begin`; break;
        case 'test-completion': subject = `Your ${templateFields.testType} Test Results are Ready`; break;
        case 'dmit-scans': subject = 'DMIT Scans Successfully Collected'; break;
        case 'counseling': subject = `${templateFields.action.charAt(0).toUpperCase() + templateFields.action.slice(1)} Counseling Session`; break;
        case 'appointment': subject = 'Appointment Confirmed'; break;
      }
      
      await database.logEmail(
        customer.id, 
        emailType, 
        recipientEmail, 
        displayName, 
        subject,
        result.success ? 'sent' : 'failed',
        result.success ? null : result.message
      );
    } catch (logError) {
      console.error('Error logging email:', logError);
    }

    res.json(result);
  } catch (error) {
    console.error('Admin send email error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all customers
app.get('/api/admin/customers', async (req, res) => {
  try {
    const customers = await database.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add new customer
app.post('/api/admin/customers', async (req, res) => {
  try {
    const { displayName, email } = req.body;
    
    if (!displayName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: displayName, email' 
      });
    }

    const customer = await database.addCustomer(displayName, email);
    res.json({ success: true, customer });
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get email logs
app.get('/api/admin/email-logs', async (req, res) => {
  try {
    const logs = await database.getEmailLogs();
    res.json(logs);
  } catch (error) {
    console.error('Error getting email logs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get statistics
app.get('/api/admin/statistics', async (req, res) => {
  try {
    const [customers, emailStats] = await Promise.all([
      database.getAllCustomers(),
      database.getEmailStats()
    ]);

    const totalEmails = emailStats.reduce((sum, stat) => sum + stat.total_sent, 0);
    const successfulEmails = emailStats.reduce((sum, stat) => sum + stat.successful, 0);
    const failedEmails = emailStats.reduce((sum, stat) => sum + stat.failed, 0);

    res.json({
      totalCustomers: customers.length,
      totalEmails,
      successfulEmails,
      failedEmails,
      emailTypeStats: emailStats
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Test endpoint to run all email tests
app.get('/api/test-emails', async (req, res) => {
  try {
    const testResults = [];
    
    // Test 1: Registration Email
    const regResult = await emailService.sendRegistrationEmail({
      username: 'Test User',
      emailid: 'test@example.com',
      usercode: 'TEST123'
    }, 'psychometric');
    testResults.push({ test: 'Registration Email', result: regResult });

    // Test 2: Test Start Email
    const startResult = await emailService.sendTestStartEmail({
      username: 'Test User',
      emailid: 'test@example.com'
    }, 'https://example.com/start', 'https://example.com/resume', 'psychometric');
    testResults.push({ test: 'Test Start Email', result: startResult });

    // Test 3: Test Completion Email
    const completionResult = await emailService.sendTestCompletionEmail({
      username: 'Test User',
      emailid: 'test@example.com'
    }, 'https://example.com/report', 'psychometric');
    testResults.push({ test: 'Test Completion Email', result: completionResult });

    // Test 4: DMIT Scans Email
    const dmitResult = await emailService.sendDMITScansCollectedEmail({
      username: 'Test User',
      emailid: 'test@example.com'
    });
    testResults.push({ test: 'DMIT Scans Email', result: dmitResult });

    // Test 5: Counseling Session Email
    const counselingResult = await emailService.sendCounselingSessionEmail({
      username: 'Test User',
      emailid: 'test@example.com'
    }, 'schedule', {
      date: '2024-02-20',
      time: '10:00 AM',
      counselor: 'Dr. Smith',
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    });
    testResults.push({ test: 'Counseling Session Email', result: counselingResult });

    res.json({
      success: true,
      message: 'All email tests completed',
      results: testResults
    });
  } catch (error) {
    console.error('Email tests error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'BCI Email Service',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
  console.log(`🚀 BCI Email Service running on http://localhost:${PORT}`);
  console.log(`📧 Email endpoints available:`);
  console.log(`   POST /book - Original appointment booking`);
  console.log(`   POST /api/email/registration - Registration email`);
  console.log(`   POST /api/email/test-start - Test start email`);
  console.log(`   POST /api/email/test-completion - Test completion email`);
  console.log(`   POST /api/email/dmit-scans - DMIT scans collected email`);
  console.log(`   POST /api/email/counseling - Counseling session email`);
  console.log(`   GET /api/test-emails - Run all email tests`);
  console.log(`   GET /api/health - Health check`);
  console.log(`🔧 Admin endpoints available:`);
  console.log(`   GET /admin - Admin panel`);
  console.log(`   POST /api/admin/send-email - Send manual email`);
  console.log(`   GET /api/admin/customers - Get all customers`);
  console.log(`   POST /api/admin/customers - Add new customer`);
  console.log(`   GET /api/admin/email-logs - Get email logs`);
  console.log(`   GET /api/admin/statistics - Get statistics`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  database.close();
  process.exit(0);
});

module.exports = app;
