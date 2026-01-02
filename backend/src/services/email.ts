export const sendOTPEmail = async (email: string, otp: string): Promise<void> => {
  // In production, integrate with services like SendGrid, AWS SES, or Nodemailer
  console.log(`Sending OTP ${otp} to ${email}`);
  
  // For demo purposes, just log the OTP
  // In production, you would send an actual email here
  // Example with nodemailer:
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: email,
  //   subject: 'Your OTP Code',
  //   text: `Your verification code is: ${otp}`,
  //   html: `<p>Your verification code is: <strong>${otp}</strong></p>`
  // });
};
