import type { OrderItem } from "./firestore";

/**
 * Generate a WhatsApp message from order data
 * @param items - Array of order items
 * @param totalAmount - Total order amount
 * @param customerPhone - Customer phone number
 * @param deliveryAddress - Delivery address
 * @returns Formatted message string for WhatsApp
 */
export function generateOrderMessage(
  items: OrderItem[],
  totalAmount: number,
  customerPhone: string,
  deliveryAddress: string
): string {
  const itemsList = items
    .map((item) => `• ${item.name} × ${item.quantity} = ${item.price * item.quantity} ج.م`)
    .join("\n");

  const message = `
🛍️ *طلب جديد من OZERA*

👤 *بيانات العميل:*
رقم الهاتف: ${customerPhone}
العنوان: ${deliveryAddress}

📦 *المنتجات:*
${itemsList}

💰 *الإجمالي: ${totalAmount} ج.م*

---
تم الطلب عبر تطبيق OZERA
شكراً لك! ✨
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
  adminPhoneNumber: string = "209546481125"
): void {
  const message = generateOrderMessage(items, totalAmount, customerPhone, deliveryAddress);
  redirectToWhatsApp(message, adminPhoneNumber);
}
