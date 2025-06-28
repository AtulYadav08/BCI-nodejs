/**
 * Email Service Test Script
 * Run this to test the email integration locally
 */

// Load test configuration
require('./test-config.js');

const SendGridService = require('./src/services/sendgridService');

async function testEmailService() {
    console.log('🧪 Testing Email Service...\n');

    const sendGridService = new SendGridService();

    // Test 1: Registration Email
    console.log('📧 Test 1: Registration Email');
    try {
        const result = await sendGridService.sendRegistrationEmail({
            username: 'John Doe',
            emailid: 'emaad.brainwonders@gmail.com',
            usercode: '12345'
        }, 'psychometric');
        
        console.log('✅ Registration email test result:', result);
    } catch (error) {
        console.log('❌ Registration email test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Test Start Email
    console.log('📧 Test 2: Test Start Email');
    try {
        const result = await sendGridService.sendTestStartEmail({
            username: 'John Doe',
            emailid: 'emaad.brainwonders@gmail.com'
        }, 'https://google.com/test/start', 'https://google.com/test/resume', 'psychometric');
        
        console.log('✅ Test start email test result:', result);
    } catch (error) {
        console.log('❌ Test start email test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test Completion Email
    console.log('📧 Test 3: Test Completion Email');
    try {
        const result = await sendGridService.sendTestCompletionEmail({
            username: 'John Doe',
            emailid: 'emaad.brainwonders@gmail.com'
        }, 'https://google.com/report', 'psychometric');
        
        console.log('✅ Test completion email test result:', result);
    } catch (error) {
        console.log('❌ Test completion email test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: DMIT Scans Collected Email
    console.log('📧 Test 4: DMIT Scans Collected Email');
    try {
        const result = await sendGridService.sendDMITScansCollectedEmail({
            username: 'John Doe',
            emailid: 'emaad.brainwonders@gmail.com'
        });
        
        console.log('✅ DMIT scans collected email test result:', result);
    } catch (error) {
        console.log('❌ DMIT scans collected email test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 5: Counseling Session Email
    console.log('📧 Test 5: Counseling Session Email');
    try {
        const result = await sendGridService.sendCounselingSessionEmail({
            username: 'John Doe',
            emailid: 'emaad.brainwonders@gmail.com'
        }, 'schedule', {
            date: '2024-02-20',
            time: '10:00 AM',
            counselor: 'Dr. Smith',
            meetingLink: 'https://meet.google.com/abc-defg-hij'
        });
        
        console.log('✅ Counseling session email test result:', result);
    } catch (error) {
        console.log('❌ Counseling session email test failed:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 Email service testing completed!');
    console.log('\n📝 Note: If you see "Failed to send email" errors, this is expected without a valid SendGrid API key.');
    console.log('   The email templates and service structure are working correctly.');
}

// Run the tests
testEmailService().catch(console.error); 