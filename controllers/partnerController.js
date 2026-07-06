const { sendPartnerEmail } = require("../services/emailService");

const partnerEnquiry = async (req, res) => {
  try {
    const {
      name,
      organisation,
      email,
      phone,
      city,
      state,
      message,
    } = req.body;

    if (
      !name ||
      !organisation ||
      !email ||
      !phone ||
      !city ||
      !state ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const sent = await sendPartnerEmail({
      name,
      organisation,
      email,
      phone,
      city,
      state,
      message,
    });

    if (!sent) {
      return res.status(500).json({
        success: false,
        message: "Unable to send enquiry.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Thank you for your interest. Our partnership team will contact you shortly.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = {
  partnerEnquiry,
};