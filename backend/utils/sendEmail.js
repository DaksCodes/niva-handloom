const { Resend } = require('resend');

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const sendAdminOrderEmail = async (order) => {
  try {
    const orderItemsHtml = order.orderItems.map((item) => {
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

    // Send email using Resend HTTP API
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Resend ka default testing email sender
      to: process.env.ADMIN_EMAIL,   // Aapka verified admin email
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
    });

    if (error) {
      console.error('Resend API Error:', error);
      return;
    }

    console.log('Admin notification email sent successfully via Resend!', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendAdminOrderEmail };