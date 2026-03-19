const PDFDocument = require('pdfkit');

/**
 * Generate a bill/invoice as a PDF buffer
 */
const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // Header
        const path = require('path');
        const logoPath = path.join(__dirname, '..', '..', 'client', 'public', 'logo.png');
        
        try {
            doc.image(logoPath, 50, 45, { width: 50 });
        } catch (e) {
            console.error('Logo not found for PDF');
        }

        doc.fillColor('#000').fontSize(20).text('ATTIRE', 110, 50);
        doc.fillColor('#444444').fontSize(8).text('The complete mens wear', 110, 75);
        doc.fontSize(8).text('186, Erode main Road, Near soorya hospital,', 110, 85);
        doc.text('Tiruchengode - 637211. Phone: 8838722957', 110, 95);
        doc.moveDown();

        // Invoice info
        doc.fillColor('#333').fontSize(16).text('INVOICE', 50, 120);
        doc.fontSize(10).text(`Order Number: #${order.orderNumber}`, 50, 140);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, 155);
        doc.text(`Payment Status: ${order.paymentStatus}`, 50, 170);
        doc.text(`Transaction ID: ${order.paymentDetails?.paymentId || 'N/A'}`, 50, 185);

        // Shipping Address
        doc.fontSize(12).text('Shipping To:', 350, 120);
        doc.fontSize(10).text(order.shippingAddress.name, 350, 140);
        doc.text(order.shippingAddress.street, 350, 155);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`, 350, 170);
        doc.text(order.shippingAddress.country, 350, 185);
        doc.text(order.shippingAddress.phone, 350, 200);

        // Line
        doc.moveTo(50, 230).lineTo(550, 230).stroke();

        // Items Table Header
        let y = 250;
        doc.fontSize(10).text('Product', 50, y);
        doc.text('Size/Color', 250, y);
        doc.text('Qty', 350, y);
        doc.text('Price', 400, y);
        doc.text('Total', 500, y);

        y += 20;
        doc.moveTo(50, y).lineTo(550, y).stroke('#eee');
        y += 10;

        // Items
        order.items.forEach(item => {
            doc.text(item.name, 50, y, { width: 190 });
            doc.text(`${item.size || '-'} / ${item.color || '-'}`, 250, y);
            doc.text(item.quantity.toString(), 350, y);
            doc.text(`₹${item.price.toLocaleString()}`, 400, y);
            doc.text(`₹${(item.price * item.quantity).toLocaleString()}`, 500, y);
            y += 25;
        });

        // Line
        doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke('#eee');
        y += 30;

        // Totals
        const rightColumn = 400;
        doc.text('Subtotal:', rightColumn, y);
        doc.text(`₹${order.subtotal.toLocaleString()}`, 500, y);
        y += 20;
        doc.text('Shipping:', rightColumn, y);
        doc.text(`₹${order.shippingCost.toLocaleString()}`, 500, y);
        y += 20;
        doc.text('Tax:', rightColumn, y);
        doc.text(`₹${order.tax.toLocaleString()}`, 500, y);
        y += 25;
        doc.fontSize(14).text('Total Amount:', rightColumn, y);
        doc.text(`₹${order.total.toLocaleString()}`, 500, y);

        // Footer
        doc.fontSize(10).fillColor('#777').text('Delivery expected in 15 days.', 50, 700, { align: 'center' });
        doc.text('Thank you for choosing Attire.', 50, 715, { align: 'center' });

        doc.end();
    });
};

module.exports = { generateInvoice };
