/**
 * Generates and automatically downloads a luxury order card in JPG format
 */
export function generateOrderCardJpg({
  orderNumber,
  customerName,
  customerPhone,
  deliveryAddress,
  isDhakaCityCorp,
  items,
  subtotal,
  deliveryCharge,
  totalAmount,
}) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const width = 850;
  // Dynamic height based on number of items
  const baseHeight = 720;
  const itemsHeight = Math.max(1, items.length) * 45;
  const height = baseHeight + itemsHeight;

  // Scale for retina/high-resolution
  const scale = 2;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // 1. Background
  ctx.fillStyle = '#faf8f5';
  ctx.fillRect(0, 0, width, height);

  // 2. Borders
  ctx.strokeStyle = '#b88b42';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = '#eae5de';
  ctx.lineWidth = 1;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // 3. Header
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1c1a17';
  ctx.font = '600 32px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('EALETAS', width / 2, 75);

  ctx.fillStyle = '#b88b42';
  ctx.font = '600 10px "Montserrat", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('FINE JEWELRY ATELIER • DHAKA', width / 2, 95);

  // Decorative divider
  ctx.strokeStyle = '#dcd5cb';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 140, 115);
  ctx.lineTo(width / 2 - 25, 115);
  ctx.moveTo(width / 2 + 25, 115);
  ctx.lineTo(width / 2 + 140, 115);
  ctx.stroke();

  ctx.fillStyle = '#b88b42';
  ctx.font = '14px serif';
  ctx.fillText('✦', width / 2, 119);

  // 4. Order Confirmation Badge
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f4efe8';
  ctx.fillRect(45, 140, width - 90, 60);
  ctx.strokeStyle = '#ebdcc7';
  ctx.strokeRect(45, 140, width - 90, 60);

  ctx.fillStyle = '#1c1a17';
  ctx.font = '600 13px "Montserrat", sans-serif';
  ctx.fillText(`ORDER CONFIRMED: #${orderNumber}`, 65, 165);

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  ctx.fillStyle = '#6b665f';
  ctx.font = '400 11px "Montserrat", sans-serif';
  ctx.fillText(`Date: ${dateStr}  |  Payment: Cash on Delivery`, 65, 185);

  // 5. Customer & Shipping Info Box
  let y = 230;
  ctx.fillStyle = '#b88b42';
  ctx.font = '600 11px "Montserrat", sans-serif';
  ctx.fillText('CUSTOMER & SHIPPING DETAILS', 45, y);

  y += 22;
  ctx.fillStyle = '#1c1a17';
  ctx.font = '500 13px "Montserrat", sans-serif';
  ctx.fillText(`Customer: ${customerName}`, 45, y);

  ctx.fillStyle = '#6b665f';
  ctx.font = '400 12px "Montserrat", sans-serif';
  ctx.fillText(`Phone: ${customerPhone}`, 450, y);

  y += 20;
  ctx.fillText(`Shipping Address: ${deliveryAddress}`, 45, y);

  y += 20;
  const zoneText = isDhakaCityCorp
    ? 'Zone: Inside Dhaka City Corporation (North & South) — ৳80'
    : 'Zone: Outside Dhaka / Nationwide Delivery — ৳120';
  ctx.fillStyle = '#b88b42';
  ctx.font = '600 11px "Montserrat", sans-serif';
  ctx.fillText(zoneText, 45, y);

  // 6. Items Table Header
  y += 35;
  ctx.fillStyle = '#1c1a17';
  ctx.fillRect(45, y, width - 90, 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 11px "Montserrat", sans-serif';
  ctx.fillText('ITEM CREATION', 60, y + 20);
  ctx.textAlign = 'center';
  ctx.fillText('QTY', 520, y + 20);
  ctx.textAlign = 'right';
  ctx.fillText('UNIT PRICE', 670, y + 20);
  ctx.fillText('TOTAL', width - 60, y + 20);

  // 7. Items Rows
  y += 32;
  items.forEach((item, index) => {
    ctx.fillStyle = index % 2 === 0 ? '#ffffff' : '#faf8f5';
    ctx.fillRect(45, y, width - 90, 40);
    ctx.strokeStyle = '#eae5de';
    ctx.strokeRect(45, y, width - 90, 40);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1c1a17';
    ctx.font = '500 12px "Montserrat", sans-serif';
    ctx.fillText(item.name || item.productName || 'Jewelry Item', 60, y + 24);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b665f';
    ctx.fillText(String(item.quantity), 520, y + 24);

    ctx.textAlign = 'right';
    ctx.fillText(`৳${Number(item.price).toLocaleString()}`, 670, y + 24);

    const lineTotal = Number(item.price) * Number(item.quantity);
    ctx.fillStyle = '#1c1a17';
    ctx.font = '600 12px "Montserrat", sans-serif';
    ctx.fillText(`৳${lineTotal.toLocaleString()}`, width - 60, y + 24);

    y += 40;
  });

  // 8. Totals Calculation Box
  y += 20;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#6b665f';
  ctx.font = '400 12px "Montserrat", sans-serif';
  ctx.fillText('Items Subtotal:', width - 180, y);
  ctx.fillStyle = '#1c1a17';
  ctx.font = '600 12px "Montserrat", sans-serif';
  ctx.fillText(`৳${Number(subtotal).toLocaleString()}`, width - 60, y);

  y += 22;
  ctx.fillStyle = '#6b665f';
  ctx.font = '400 12px "Montserrat", sans-serif';
  ctx.fillText('Delivery Charge:', width - 180, y);
  ctx.fillStyle = '#1c1a17';
  ctx.font = '600 12px "Montserrat", sans-serif';
  ctx.fillText(`৳${Number(deliveryCharge).toLocaleString()}`, width - 60, y);

  y += 12;
  ctx.strokeStyle = '#b88b42';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width - 320, y);
  ctx.lineTo(width - 45, y);
  ctx.stroke();

  y += 26;
  ctx.fillStyle = '#1c1a17';
  ctx.font = '700 14px "Montserrat", sans-serif';
  ctx.fillText('TOTAL PAYABLE (COD):', width - 180, y);
  ctx.fillStyle = '#b88b42';
  ctx.font = '700 18px "Montserrat", sans-serif';
  ctx.fillText(`৳${Number(totalAmount).toLocaleString()}`, width - 60, y);

  // 9. Footer Note
  y += 50;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b665f';
  ctx.font = 'italic 12px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Thank you for acquiring an Ealetas creation. May it shine through your finest moments.', width / 2, y);

  y += 20;
  ctx.fillStyle = '#8e8880';
  ctx.font = '400 10px "Montserrat", sans-serif';
  ctx.fillText('For concierge service, repairs, or verification, present this order card.', width / 2, y);

  // 10. Convert to JPG & Trigger Automatic Download
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

  const link = document.createElement('a');
  link.download = `Ealetas-Order-${orderNumber}.jpg`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return dataUrl;
}
