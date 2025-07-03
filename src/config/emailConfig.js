import nodemailer from 'nodemailer';

// Email service configuration
const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  let transporter;
  
  if (emailService.toLowerCase() === 'gmail') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      }
    });
  }
  
  return transporter;
};

export default createEmailTransporter;
