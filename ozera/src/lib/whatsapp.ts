import type { OrderItem } from "./firestore";

/**
 * Generate a WhatsApp message from order data
 * @param items - Array of order items
 * @param totalAmount - Total order amount
 * @param customerPhone - Customer phone number
 * @param deliveryAddress - Delivery address
 * @param orderId - Order ID from Firebase
 * @returns Formatted message string for WhatsApp
 */
export function generateOrderMessage(
  items: OrderItem[],
  totalAmount: number,
  customerPhone: string,
  deliveryAddress: string,
  orderId: string
): string {
  const itemsList = items
    .map(
      (item) =>
        `• *${item.name}*\n  الكمية: ${item.quantity}\n  السعر: ${item.price * item.quantity} ج.م`
    )
    .join("\n\n");

  const message = `
🛍️ *طلب جديد من OZERA*

📄 *تفاصيل الطلب*
رقم الطلب: *${orderId.slice(0, 8).toUpperCase()}*

👤 *بيانات العميل*
• رقم الهاتف: ${customerPhone}
• العنوان: ${deliveryAddress}

📦 *المنتجات المطلوبة*
${itemsList}

💰 *الإجمالي:* *${totalAmount} ج.م*

━━━━━━━━━━━━━
تم استلام الطلب عبر *تطبيق OZERA*  
نشكر ثقتك بنا ✨
  `.trim();

  return message;
}


/**
 * Redirect to WhatsApp with order message
 * @param message - Message to send
 * @param adminPhoneNumber - Admin phone number to send message to (format: 20XXXXXXXXXX)
 */
export function redirectToWhatsApp(message: string, adminPhoneNumber: string = "209546481125"): void {
  // Ensure phone number format (remove + if present, keep only digits)
  const formattedPhone = adminPhoneNumber.replace(/\D/g, "");
  
  // WhatsApp Web API link
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  
  // Open in new tab
  window.open(whatsappUrl, "_blank");
}

/**
 * Combined function to generate message and redirect to WhatsApp
 */
export function sendOrderToWhatsApp(
  items: OrderItem[],
  totalAmount: number,
  customerPhone: string,
  deliveryAddress: string,
  orderId: string,
  adminPhoneNumber: string = "966546481125"
): void {
  const message = generateOrderMessage(items, totalAmount, customerPhone, deliveryAddress, orderId);
  redirectToWhatsApp(message, adminPhoneNumber);
}
