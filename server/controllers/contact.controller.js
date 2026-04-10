export const sendContactMessage = async (req, res) => {
    try {
        const { name, mobile, email, organization, designation, comments } = req.body;

        if (!name || !mobile || !comments) {
            return res.status(400).json({ success: false, message: "Name, Mobile, and Message/Query are required fields." });
        }

        if (!/^\d{10}$/.test(mobile)) {
            return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 digits." });
        }

        // Email sending has been moved to the frontend via EmailJS. 
        // This endpoint no longer handles emails backend-side, but logs the interaction.
        console.log(`New contact submission from ${name} (${mobile}) recorded. EmailJS handles the mail on the frontend.`);

        return res.status(200).json({ success: true, message: "Message processed successfully." });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
    }
};
