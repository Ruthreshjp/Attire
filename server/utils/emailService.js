const sendEmail = async (to, subject, text, html, attachments = [], retries = 2) => {
    for (let i = 0; i <= retries; i++) {
        try {
            // Using Resend REST API (Port 443) to completely bypass Render's 587 Networking Blocks
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer re_KcW83cKB_BMr3B2nzdQNU289ar2vjQRxE',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Attire Support <onboarding@resend.dev>', // Resend free tier requires this generic sender
                    to: to,
                    subject: subject,
                    text: text,
                    html: html
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || JSON.stringify(data));
            }
            
            console.log(`Port 443 Resend API Email Sent Successfully (Attempt ${i + 1}):`, data.id);
            return { success: true, info: data };
        } catch (error) {
            console.error(`Resend API sending error (Attempt ${i + 1}):`, error.message || error);
            if (i === retries) return { success: false, error };
            console.log('Retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
};

// Professional Simple English Templates

const sendOrderConfirmation = async (userEmail, order, pdfBuffer) => {
    const subject = `Order Confirmed - #${order.orderNumber}`;
    const text = `Dear ${order.shippingAddress.name},\n\nYour order #${order.orderNumber} has been successfully placed. Your payment was successful.\n\nYour order will be delivered in the next 15 days.\n\nPlease find the attached bill for your reference.\n\nThank you for shopping with Attire!`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c5a059; text-align: center;">Order Confirmed!</h2>
            <p>Dear <strong>${order.shippingAddress.name}</strong>,</p>
            <p>Your order <strong>#${order.orderNumber}</strong> has been successfully placed. Your payment was successful.</p>
            <p>Your order will be delivered in the next <strong>15 days</strong>.</p>
            <p>Please find the attached bill for your reference.</p>
            <p>Thank you for shopping with <strong>Attire</strong>!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777; text-align: center;">Attire E-commerce | Premium Apparel</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html, [
        {
            filename: `Invoice_${order.orderNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
    ]);
};

const sendAdminNewOrder = async (order, pdfBuffer) => {
    const subject = `New Order Received - #${order.orderNumber}`;
    const text = `New order placed by ${order.shippingAddress.name} (${order._id}).\nTransaction ID: ${order.paymentDetails?.paymentId || 'N/A'}\nTotal Amount: ₹${order.total}\n\nPlease check the attached document for full details.`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #333;">New Order Alert</h2>
            <p>A new order has been placed on the website.</p>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px;"><strong>Order ID:</strong></td><td>#${order.orderNumber}</td></tr>
                <tr><td style="padding: 5px;"><strong>Customer:</strong></td><td>${order.shippingAddress.name}</td></tr>
                <tr><td style="padding: 5px;"><strong>Transaction ID:</strong></td><td>${order.paymentDetails?.paymentId || 'N/A'}</td></tr>
                <tr><td style="padding: 5px;"><strong>Total Amount:</strong></td><td>₹${order.total}</td></tr>
            </table>
            <p>Full details are attached as a document.</p>
        </div>
    `;

    return await sendEmail('travelzonnee@gmail.com', subject, text, html, [
        {
            filename: `Order_Details_${order.orderNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }
    ]);
};

const sendCancelRequestUser = async (userEmail, orderNumber) => {
    const subject = `Cancellation Request - #${orderNumber}`;
    const text = `Dear Customer,\n\nYour cancellation request for order #${orderNumber} is being processed. Please wait for confirmation from our admin team.\n\nThank you.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3 style="color: #c62828;">Cancellation Request Received</h3>
            <p>Your request is being processed. Please wait for confirmation from the admin.</p>
            <p>Order Number: <strong>#${orderNumber}</strong></p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendCancelRequestAdmin = async (orderNumber) => {
    const subject = `Order Cancellation Request - #${orderNumber}`;
    const text = `A new cancellation request has been submitted for order #${orderNumber}. Please review it in the admin dashboard.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3 style="color: #333;">Action Required: Cancel Request</h3>
            <p>A new cancellation request is there in the dashboard for order <strong>#${orderNumber}</strong>.</p>
        </div>
    `;

    return await sendEmail('travelzonnee@gmail.com', subject, text, html);
};

const sendRefundProcessed = async (userEmail, orderNumber, amount) => {
    const subject = `Refund Processed - #${orderNumber}`;
    const text = `Dear Customer,\n\nYour amount of ₹${amount} is refunded and your cancel request has been processed for order #${orderNumber}.\n\nThank you.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3 style="color: #2e7d32;">Refund Processed</h3>
            <p>Your amount of <strong>₹${amount}</strong> is refunded and your cancel request has been processed.</p>
            <p>Order Number: <strong>#${orderNumber}</strong></p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendVerificationCode = async (userEmail, code) => {
    const subject = `Email Verification - Attire`;
    const text = `Your verification code is: ${code}`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
            <h2>Email Verification</h2>
            <p>Please use the following code to verify your email address:</p>
            <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f0f0f0; border-radius: 5px; display: inline-block;">
                ${code}
            </div>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendAbandonedCartReminder = async (userEmail, userName) => {
    const subject = `Wait! You left something in your cart`;
    const text = `Hi ${userName},\n\nWe noticed you added items to your cart but didn't checkout. Complete your purchase now!\n\nShop at Attire.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3>Ready to checkout?</h3>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We noticed you added items to your cart but didn't checkout. Don't miss out on these premium pieces!</p>
            <p><a href="http://localhost:3000/cart" style="background: #1a1a1a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Checkout and Buy</a></p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendWelcomeEmail = async (userEmail, userName) => {
    const subject = `Welcome to The Club - Attire`;
    const text = `Hi ${userName},\n\nWelcome to Attire! We are thrilled to have you here. Discover exclusive drops, personalized recommendations, and seamless shopping.\n\nThank you for choosing Attire.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #c5a059; font-family: 'Playfair Display', serif; margin: 0;">Welcome to ATTIRE</h1>
                <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #aaa;">Premium Clothing & Lifestyle</p>
            </div>
            <p style="font-size: 16px; color: #333;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                We are thrilled to welcome you to the club. Your account is now verified, unlocking exclusive drops, personalized recommendations, and seamless shopping.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background: #000; color: #c5a059; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Start Exploring</a>
            </div>
            <p style="font-size: 14px; color: #777;">Thank you for choosing Attire.</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendReturnRequestUser = async (userEmail, orderNumber) => {
    const subject = `Return Request Received - #${orderNumber}`;
    const text = `Dear Customer,\n\nYour return request for order #${orderNumber} has been received. Please courier the product to:\n\nAttire The complete mens wear,\n186, Erode main Road,\nNear soorya hospital,\nTiruchengode - 637211\nPhone: 8838722957\n\nYour refund will be processed after we receive the product and complete quality checks.\n\nThank you for shopping with Attire!`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c5a059; text-align: center;">Return Request Received</h2>
            <p>Dear Customer,</p>
            <p>Your return request for order <strong>#${orderNumber}</strong> has been received.</p>
            <div style="background: #fdfaf3; border: 1px solid #f1e4c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #8a6d3b;">Please courier the product to:</h4>
                <p style="margin-bottom: 0; font-family: monospace;">
                    Attire The complete mens wear,<br>
                    186, Erode main Road,<br>
                    Near soorya hospital,<br>
                    Tiruchengode - 637211<br>
                    Phone: 8838722957
                </p>
            </div>
            <p>Your refund will be processed after we receive the product and complete quality checks.</p>
            <p>Thank you for shopping with <strong>Attire</strong>!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777; text-align: center;">Attire E-commerce | Premium Apparel</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendReturnRequestAdmin = async (orderNumber) => {
    const subject = `New Return Request - #${orderNumber}`;
    const text = `A new return request has been submitted for order #${orderNumber}. Please review it in the admin dashboard.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px;">
            <h3 style="color: #333;">Action Required: Return Request</h3>
            <p>A new return request has been submitted for order <strong>#${orderNumber}</strong>.</p>
            <p>Please review the bank details and status in the admin dashboard.</p>
        </div>
    `;

    return await sendEmail('travelzonnee@gmail.com', subject, text, html);
};

const sendReturnProcessed = async (userEmail, orderNumber, amount, comment) => {
    const subject = `Return Processed & Refunded - #${orderNumber}`;
    const text = `Dear Customer,\n\nYour return for order #${orderNumber} has been processed. A refund of ₹${amount} has been initiated to your account.\n\nAdmin Comment: ${comment || 'No comments'}\n\nThank you for shopping with Attire!`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2e7d32; text-align: center;">Return Processed</h2>
            <p>Dear Customer,</p>
            <p>Your return for order <strong>#${orderNumber}</strong> has been successfully processed.</p>
            <p>A refund of <strong>₹${amount}</strong> has been initiated to your provided bank account.</p>
            ${comment ? `<div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;"><strong>Admin Comment:</strong><br>${comment}</div>` : ''}
            <p>Thank you for shopping with <strong>Attire</strong>!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777; text-align: center;">Attire E-commerce | Premium Apparel</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

const sendReturnCommentOnly = async (userEmail, orderNumber, comment) => {
    const subject = `Status Update: Return Request - #${orderNumber}`;
    const text = `Dear Customer,\n\nThere is an update on your return request for order #${orderNumber}.\n\nAdmin Comment: ${comment || 'No comments'}\n\nOur team is reviewing your request. Please check the dashboard for more details.\n\nThank you for shopping with Attire!`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #c5a059; text-align: center;">Return Status Update</h2>
            <p>Dear Customer,</p>
            <p>There is an update regarding your return request for order <strong>#${orderNumber}</strong>.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin-top: 0;">Admin Feedback:</h4>
                <p style="margin-bottom: 0;">${comment || 'The admin has reviewed your request. Please follow any instructions provided.'}</p>
            </div>
            <p>Our team is continuing to process your request. You can track the status in your order history.</p>
            <p>Thank you for shopping with <strong>Attire</strong>!</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #777; text-align: center;">Attire E-commerce | Premium Apparel</p>
        </div>
    `;

    return await sendEmail(userEmail, subject, text, html);
};

module.exports = {
    sendOrderConfirmation,
    sendAdminNewOrder,
    sendCancelRequestUser,
    sendCancelRequestAdmin,
    sendRefundProcessed,
    sendVerificationCode,
    sendAbandonedCartReminder,
    sendWelcomeEmail,
    sendReturnRequestUser,
    sendReturnRequestAdmin,
    sendReturnProcessed,
    sendReturnCommentOnly
};
