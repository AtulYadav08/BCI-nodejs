/**
 * Test Configuration for Email Service
 * This file sets up the environment for testing email functionality
 */

require('dotenv').config();

// Set default test values if environment variables are not set
if (!process.env.SENDGRID_API_KEY) {
    console.log('⚠️  SENDGRID_API_KEY not found in environment variables');
    console.log('   Setting a dummy key for testing (emails will not be sent)');
    process.env.SENDGRID_API_KEY = 'dummy-key-for-testing';
}

if (!process.env.FROM_EMAIL) {
    console.log('⚠️  FROM_EMAIL not found in environment variables');
    console.log('   Setting default from email for testing');
    process.env.FROM_EMAIL = 'test@bci.com';
}

console.log('✅ Test configuration loaded successfully');
console.log(`📧 From Email: ${process.env.FROM_EMAIL}`);
console.log(`🔑 API Key: ${process.env.SENDGRID_API_KEY.substring(0, 10)}...`); 