import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

const OrderInvoice = ({ order, productsList }) => {
  const invoiceRef = useRef(null);

  const downloadPDF = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    try {
      // Canvas mein convert karein
      const canvas = await html2canvas(input, {
        scale: 2, // High resolution ke liye
        useCORS: true, // Images load hone ke liye
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Niva_Handlooms_Invoice_${order._id?.slice(-6).toUpperCase() || 'ORDER'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const formattedDate = order.createdAt 
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'N/A';

  return (
    <div>
      {/* Download Button for Customer */}
      <button 
        onClick={downloadPDF} 
        style={{
          display: 'flex',
          alignItems: 'center', 
          gap: '6px',
          background: '#d97706',
          color: '#fff',
          border: 'none',
          padding: '8px 14px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          fontSize: '13px',
          whiteSpace: 'nowrap'
        }}
      >
        <Download size={15} /> Download Invoice
      </button>

      {/* Hidden Clean Invoice Template for PDF Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={invoiceRef} 
          style={{
            width: '700px',
            padding: '40px',
            background: '#ffffff',
            color: '#1e293b',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
            <div>
              <h1 style={{ margin: '0', color: '#d97706', fontSize: '26px' }}>Niva Handlooms</h1>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Premium Bedsheets & Deewan Sets</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0', fontSize: '18px', color: '#334155' }}>TAX INVOICE</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Order ID: #{order._id?.slice(-6).toUpperCase()}</p>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Date: {formattedDate}</p>
            </div>
          </div>

          {/* Customer & Delivery Info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '25px', fontSize: '13px' }}>
            <div>
              <strong>Shipped To:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#475569' }}>{order.user?.name || order.shippingAddress?.fullName || 'Valued Customer'}</p>
              <p style={{ margin: '2px 0 0 0', color: '#475569' }}>{order.shippingAddress?.address || 'Self-Pickup Order'}</p>
              <p style={{ margin: '2px 0 0 0', color: '#475569' }}>Phone: {order.user?.phone || order.shippingAddress?.phone || 'N/A'}</p>
            </div>
            <div>
              <strong>Delivery Method:</strong>
              <p style={{ margin: '4px 0 0 0', color: '#d97706', fontWeight: 'bold' }}>{order.deliveryMethod}</p>
              <p style={{ margin: '4px 0 0 0', color: '#475569' }}>Payment Status: <strong>{order.paymentStatus}</strong></p>
            </div>
          </div>

          {/* Products Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '25px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '10px' }}>Product</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Original Price</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Price Paid</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems?.map((item, idx) => {
                // Fixed the null check issue here
                const prod = (item.product && typeof item.product === 'object') 
                  ? item.product 
                  : (productsList?.find(p => p._id === item.product) || {});
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Added optional chaining just to be extra safe */}
                      {prod?.imageUrl && (
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name || "Product"} 
                          style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} 
                          crossOrigin="anonymous" 
                        />
                      )}
                      <div>
                        <strong>{prod?.name || item.name || 'Handloom Item'}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {prod?.size || 'Standard'} / {prod?.fabricType || 'Cotton'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>{item.qty}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', textDecoration: 'line-through', color: '#94a3b8' }}>
                      ₹{prod?.originalPrice || prod?.price || '-'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>₹{item.price}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold' }}>₹{item.price * item.qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Total Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px' }}>
            <div style={{ width: '250px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Grand Total:</span>
                <strong style={{ fontSize: '16px', color: '#d97706' }}>₹{order.totalPrice}</strong>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '15px', color: '#94a3b8', fontSize: '11px' }}>
            <p style={{ margin: '0' }}>Thank you for shopping with Niva Handlooms! For queries, contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInvoice;