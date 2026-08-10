const axios = require('axios');

const sendAdminSms = async (order) => {
  try {
    // SMS mein bohot bada text nahi bhej sakte, isliye short and crisp message banayenge
    const customerName = order.user?.name || 'Customer';
    const message = `Niva Handlooms:A new order is received! 
    Customer: ${customerName}
Amount: Rs. ${order.totalPrice}
Order ID: ${order._id}
Please check admin panel.`;

    const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: process.env.FAST2SMS_API_KEY,
        route: 'q', // 'q' means quick transactional route
        message: message,
        language: 'english',
        flash: 0,
        numbers: process.env.ADMIN_PHONE, // .env se admin ka 10-digit number uthayega
      },
    });

    console.log('Admin SMS sent successfully!', response.data.message);
  } catch (error) {
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
  }
};

module.exports = { sendAdminSms };