// @ts-nocheck
require('dotenv').config();
const Mailjet = require('node-mailjet');

async function sendTestEmail() {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  const senderEmail = process.env.MAILJET_SENDER_EMAIL;
  const destinationEmail = process.argv[2];

  if (!apiKey || !secretKey || !senderEmail) {
    console.error(
      '❌ Error: MAILJET_API_KEY, MAILJET_SECRET_KEY, and MAILJET_SENDER_EMAIL must be set in .env file',
    );
    console.log('\n📝 To get your API credentials:');
    console.log(
      '  1. Sign up at https://mailjet.com (free tier: 200 emails/day)',
    );
    console.log('  2. Go to Account Settings > REST API > API Key Management');
    console.log('  3. Copy your API Key and Secret Key');
    console.log('  4. Add to .env:');
    console.log('     MAILJET_API_KEY=your_api_key');
    console.log('     MAILJET_SECRET_KEY=your_secret_key');
    console.log('     MAILJET_SENDER_EMAIL=your-verified-email@example.com');
    process.exit(1);
  }

  if (!destinationEmail) {
    console.error('❌ Error: Please provide destination email as argument');
    console.log('Usage: node test-email.js recipient@example.com');
    process.exit(1);
  }

  console.log('📧 Sending email via Mailjet...');
  console.log(`From: ${senderEmail}`);
  console.log(`To: ${destinationEmail}`);

  const mailjet = Mailjet.apiConnect(apiKey, secretKey);

  try {
    console.log('📤 Sending email...');
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: senderEmail,
            Name: 'Collab Task Hub',
          },
          To: [
            {
              Email: destinationEmail,
            },
          ],
          Subject: 'Test Email from Mailjet',
          HTMLPart: `
            <h1>✅ Mailjet Test Successful!</h1>
            <p>This is a test email sent using Mailjet.</p>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, your Mailjet configuration is working correctly! 🎉</p>
          `,
          TextPart:
            'This is a test email from Mailjet. If you received this, your configuration is working!',
        },
      ],
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.body.Messages[0].To[0].MessageID);
    console.log('Status:', result.body.Messages[0].Status);
    console.log('\n🎉 Check your inbox at:', destinationEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);

    if (error.statusCode === 401) {
      console.log('\n💡 Authentication failed. Please check:');
      console.log('  1. MAILJET_API_KEY is correct');
      console.log('  2. MAILJET_SECRET_KEY is correct');
      console.log('  3. Your Mailjet account is active');
    } else if (error.statusCode === 400) {
      console.log('\n💡 Bad request. Please check:');
      console.log(
        '  1. MAILJET_SENDER_EMAIL is verified in your Mailjet account',
      );
      console.log('  2. The destination email is valid');
    }

    process.exit(1);
  }
}

sendTestEmail();
