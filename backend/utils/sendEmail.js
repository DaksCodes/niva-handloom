const nodemailer = require('nodemailer');

const sendAdminOrderEmail = async (order) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Kabhi kabhi network delay ki wajah se Render par timeout hota hai, isliye limit badha do
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Products ki list ko HTML table rows mein convert karna
    // Aapke schema mein quantity ko 'qty' kaha gaya hai
    const orderItemsHtml = order.orderItems.map((item) => {
      // Agar product populate hua hai toh uska naam, warna default text
      const productName = item.product ? item.product.name : 'Handloom Product';
      const productPrice = item.price || item.product?.price || 'N/A';
      
      return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${productName}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.qty}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">₹${productPrice}</td>
      </tr>`;
    }).join('');

    const customerName = order.user?.name || 'Customer';
    const customerEmail = order.user?.email || 'Not Provided';
    
    let address = 'Self-Pickup / Not Provided';
    if (order.deliveryMethod === 'Home Delivery' && order.shippingAddress) {
      address = `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order Received! Order ID: ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4CAF50;">New Order Alert! 🎉</h2>
            <p>You have received a new order on Niva Handlooms. Here are the details:</p>
            
            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details:</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>

            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment & Delivery:</h3>
            <p><strong>Total Amount:</strong> ₹${order.totalPrice}</p>
            <p><strong>Delivery Method:</strong> ${order.deliveryMethod}</p>
            <p><strong>Delivery Address:</strong> ${address}</p>

            <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px;">Products Ordered:</h3>
            <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Product</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Qty</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price</th>
                </tr>
            </thead>
            <tbody>
                ${orderItemsHtml}
            </tbody>
            </table>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendAdminOrderEmail };