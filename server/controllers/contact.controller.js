import nodemailer from 'nodemailer';

export const sendContactMessage = async (req, res) => {
    try {
        const { name, mobile, email, organization, designation, comments } = req.body;

        if (!name || !mobile || !comments) {
            return res.status(400).json({ success: false, message: "Name, Mobile, and Message/Query are required fields." });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 digits." });
        }

        // Configure the Email Transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS, // App Password
            },
        });

        // Structure the Email that you will receive
        const mailOptions = {
            from: `"${name}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            replyTo: email || process.env.SMTP_USER,
            subject: `New LMS Platform Query from ${name}`,
            text: `You have received a new message from the LMS Contact page.\n\nName: ${name}\nMobile: ${mobile}\nEmail: ${email || 'N/A'}\nOrganization: ${organization || 'N/A'}\nDesignation: ${designation || 'N/A'}\n\nComments:\n${comments || 'N/A'}`,
            html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; color: #1e293b;">
          <h2 style="color: #0d6efd; font-size: 22px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">New Connect Request from LMS 📝</h2>
          <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
          <p style="font-size: 16px;"><strong>Mobile:</strong> ${mobile}</p>
          <p style="font-size: 16px;"><strong>Email:</strong> ${email || 'N/A'}</p>
          <p style="font-size: 16px;"><strong>Organization:</strong> ${organization || 'N/A'}</p>
          <p style="font-size: 16px;"><strong>Designation:</strong> ${designation || 'N/A'}</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 24px; border-left: 4px solid #0d6efd;">
            <p style="margin: 0; color: #0f172a; font-size: 16px; white-space: pre-wrap;">${comments || 'No comments provided.'}</p>
          </div>
        </div>
      `,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: "Message sent successfully! We'll be in touch." });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
    }
};
