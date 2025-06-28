const sgMail = require('@sendgrid/mail');

class SendGridService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }

    async sendRegistrationEmail(userData, testType) {
        const msg = {
            to: userData.emailid,
            from: process.env.FROM_EMAIL,
            subject: `Welcome to ${testType} Test - Registration Confirmed`,
            text: `Hello ${userData.username},\n\nWelcome to the ${testType} test! Your registration has been confirmed.\n\nYour user code: ${userData.usercode}\n\nBest regards,\nBCI Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to ${testType} Test</h2>
                    <p>Hello <strong>${userData.username}</strong>,</p>
                    <p>Your registration has been confirmed successfully!</p>
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Your User Code:</strong> ${userData.usercode}</p>
                    </div>
                    <p>We'll be in touch soon with further instructions.</p>
                    <p>Best regards,<br>BCI Team</p>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return { success: true, message: 'Registration email sent successfully' };
        } catch (error) {
            console.error('Failed to send registration email:', error);
            return { success: false, message: 'Failed to send email' };
        }
    }

    async sendTestStartEmail(userData, startUrl, resumeUrl, testType) {
        const msg = {
            to: userData.emailid,
            from: process.env.FROM_EMAIL,
            subject: `Your ${testType} Test is Ready to Begin`,
            text: `Hello ${userData.username},\n\nYour ${testType} test is ready to begin!\n\nStart Test: ${startUrl}\nResume Test: ${resumeUrl}\n\nGood luck!\nBCI Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Your ${testType} Test is Ready!</h2>
                    <p>Hello <strong>${userData.username}</strong>,</p>
                    <p>Your ${testType} test is ready to begin. Please click the button below to start:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${startUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Test</a>
                    </div>
                    <p>If you need to resume a previous session, use this link: <a href="${resumeUrl}">Resume Test</a></p>
                    <p>Good luck!</p>
                    <p>Best regards,<br>BCI Team</p>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return { success: true, message: 'Test start email sent successfully' };
        } catch (error) {
            console.error('Failed to send test start email:', error);
            return { success: false, message: 'Failed to send email' };
        }
    }

    async sendTestCompletionEmail(userData, reportUrl, testType) {
        const msg = {
            to: userData.emailid,
            from: process.env.FROM_EMAIL,
            subject: `Your ${testType} Test Results are Ready`,
            text: `Hello ${userData.username},\n\nCongratulations! You have completed your ${testType} test.\n\nView your results: ${reportUrl}\n\nThank you for participating!\nBCI Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Test Completion - Results Ready!</h2>
                    <p>Hello <strong>${userData.username}</strong>,</p>
                    <p>Congratulations! You have successfully completed your ${testType} test.</p>
                    <p>Your detailed results are now available:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${reportUrl}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Results</a>
                    </div>
                    <p>Thank you for participating in our assessment!</p>
                    <p>Best regards,<br>BCI Team</p>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return { success: true, message: 'Test completion email sent successfully' };
        } catch (error) {
            console.error('Failed to send test completion email:', error);
            return { success: false, message: 'Failed to send email' };
        }
    }

    async sendDMITScansCollectedEmail(userData) {
        const msg = {
            to: userData.emailid,
            from: process.env.FROM_EMAIL,
            subject: 'DMIT Scans Successfully Collected',
            text: `Hello ${userData.username},\n\nGreat news! Your DMIT scans have been successfully collected and processed.\n\nWe will analyze the data and provide you with comprehensive insights soon.\n\nThank you for your patience!\nBCI Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">DMIT Scans Collected Successfully!</h2>
                    <p>Hello <strong>${userData.username}</strong>,</p>
                    <p>Great news! Your DMIT (Dermatoglyphics Multiple Intelligence Test) scans have been successfully collected and processed.</p>
                    <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; color: #155724;">✅ Scan collection completed</p>
                        <p style="margin: 0; color: #155724;">✅ Data processing in progress</p>
                    </div>
                    <p>Our team will analyze the data and provide you with comprehensive insights about your multiple intelligences profile.</p>
                    <p>We'll notify you as soon as your detailed report is ready!</p>
                    <p>Thank you for your patience.</p>
                    <p>Best regards,<br>BCI Team</p>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return { success: true, message: 'DMIT scans collected email sent successfully' };
        } catch (error) {
            console.error('Failed to send DMIT scans collected email:', error);
            return { success: false, message: 'Failed to send email' };
        }
    }

    async sendCounselingSessionEmail(userData, action, sessionDetails) {
        let subject, content;
        
        if (action === 'schedule') {
            subject = 'Counseling Session Scheduled';
            content = `
                <h2 style="color: #333;">Counseling Session Scheduled</h2>
                <p>Hello <strong>${userData.username}</strong>,</p>
                <p>Your counseling session has been scheduled successfully!</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${sessionDetails.date}</p>
                    <p><strong>Time:</strong> ${sessionDetails.time}</p>
                    <p><strong>Counselor:</strong> ${sessionDetails.counselor}</p>
                    <p><strong>Meeting Link:</strong> <a href="${sessionDetails.meetingLink}">Join Meeting</a></p>
                </div>
                <p>Please join the meeting 5 minutes before the scheduled time.</p>
            `;
        } else if (action === 'reschedule') {
            subject = 'Counseling Session Rescheduled';
            content = `
                <h2 style="color: #333;">Counseling Session Rescheduled</h2>
                <p>Hello <strong>${userData.username}</strong>,</p>
                <p>Your counseling session has been rescheduled.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>New Date:</strong> ${sessionDetails.date}</p>
                    <p><strong>New Time:</strong> ${sessionDetails.time}</p>
                    <p><strong>Counselor:</strong> ${sessionDetails.counselor}</p>
                    <p><strong>Meeting Link:</strong> <a href="${sessionDetails.meetingLink}">Join Meeting</a></p>
                </div>
                <p>We apologize for any inconvenience caused.</p>
            `;
        } else if (action === 'cancel') {
            subject = 'Counseling Session Cancelled';
            content = `
                <h2 style="color: #333;">Counseling Session Cancelled</h2>
                <p>Hello <strong>${userData.username}</strong>,</p>
                <p>Your counseling session has been cancelled.</p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Date:</strong> ${sessionDetails.date}</p>
                    <p><strong>Time:</strong> ${sessionDetails.time}</p>
                    <p><strong>Counselor:</strong> ${sessionDetails.counselor}</p>
                </div>
                <p>Please contact us to reschedule your session.</p>
            `;
        }

        const msg = {
            to: userData.emailid,
            from: process.env.FROM_EMAIL,
            subject: subject,
            text: `Hello ${userData.username},\n\n${subject}\n\nDate: ${sessionDetails.date}\nTime: ${sessionDetails.time}\nCounselor: ${sessionDetails.counselor}\n\nBest regards,\nBCI Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    ${content}
                    <p>Best regards,<br>BCI Team</p>
                </div>
            `
        };

        try {
            await sgMail.send(msg);
            return { success: true, message: 'Counseling session email sent successfully' };
        } catch (error) {
            console.error('Failed to send counseling session email:', error);
            return { success: false, message: 'Failed to send email' };
        }
    }
}

module.exports = SendGridService; 