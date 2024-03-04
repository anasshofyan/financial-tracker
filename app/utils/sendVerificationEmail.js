const nodemailer = require('nodemailer')

const sendEmail = async (email, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: true,
    },
  })

  const mailOptions = {
    from: `"Dompet Cerdas" <${process.env.EMAIL_SENDER}>`,
    to: email,
    subject,
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('Email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false }
  }
}

const sendResetPasswordEmail = async (email, token, name) => {
  const resetPasswordLink = `${process.env.CLIENT_URL}/auth/reset-password/${token}`
  const htmlContent = createEmailContent(name, 'Reset Password', resetPasswordLink, 'reset')
  return await sendEmail(email, 'Reset Password', htmlContent)
}

const sendVerificationEmail = async (email, token, name) => {
  const verificationLink = `${process.env.CLIENT_URL}/auth/verify-email/${token}`
  const htmlContent = createEmailContent(name, 'Verifikasi Email', verificationLink, 'verify')
  return await sendEmail(email, 'Verifikasi Email', htmlContent)
}

const createEmailContent = (name, action, actionLink, type) => {
  let actionText = action
  if (type === 'reset') {
    actionText = 'Atur Ulang Password'
  } else if (type === 'verify') {
    actionText = 'Verifikasi Email'
  }

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${actionText} | Dompet Cerdas</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
      <table role="presentation" align="center" width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding: 20px 0; text-align: center;">
            <h1>${actionText}</h1>
            <p>Hai, ${name}! Klik tombol di bawah untuk ${actionText.toLowerCase()}.</p>
            <table align="center" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td bgcolor="#15803" style="border-radius: 3px;">
                  <a href="${actionLink}" style="display: inline-block; padding: 10px 20px; background-color: #15803; color: #ffffff; text-decoration: none; border-radius: 3px;">${actionText}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="text-align: center; margin-top: 20px;">Makasih ya udah pakai Dompet Cerdas!</p>
      <p style="text-align: center;">© 2024 Dompet Cerdas. Made with 💖</p>
    </body>
    </html>
  `
}

module.exports = { sendVerificationEmail, sendResetPasswordEmail }
