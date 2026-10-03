/**
 * BulkSMSBD Gateway Integration
 * API URL: http://bulksmsbd.net/api/smsapi
 */

export function formatBangladeshiNumber(rawNumber) {
  if (!rawNumber) return '';
  // Remove non-digit characters
  let clean = rawNumber.toString().replace(/[^0-9]/g, '');

  // If starts with 880, keep it
  if (clean.startsWith('880') && clean.length === 13) {
    return clean;
  }
  // If starts with 01, prepend 88
  if (clean.startsWith('01') && clean.length === 11) {
    return `88${clean}`;
  }
  // If starts with 1 and length is 10, prepend 880
  if (clean.startsWith('1') && clean.length === 10) {
    return `880${clean}`;
  }

  return clean;
}

export async function sendSMS({ number, message }) {
  const apiKey = process.env.BULKSMSBD_API_KEY || 'db5Xqgy4ArAkG1FWWpxZ';
  const senderId = process.env.BULKSMSBD_SENDER_ID || '8809617619300';
  const apiUrl = process.env.BULKSMSBD_API_URL || 'http://bulksmsbd.net/api/smsapi';

  const formattedNumber = formatBangladeshiNumber(number);

  if (!formattedNumber) {
    console.error('❌ SMS failed: Invalid phone number', number);
    return { success: false, error: 'Invalid phone number' };
  }

  try {
    const url = new URL(apiUrl);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('type', 'text');
    url.searchParams.set('number', formattedNumber);
    url.searchParams.set('senderid', senderId);
    url.searchParams.set('message', message);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = await response.json().catch(async () => {
      const text = await response.text();
      return { raw: text };
    });

    console.log(`📨 SMS sent to ${formattedNumber}. Gateway response:`, data);
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Error sending SMS to ${formattedNumber}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS notification to all registered Admin phone numbers
 */
export async function notifyAdminsNewOrder({ prisma, orderNumber, totalAmount, customerName, customerPhone }) {
  try {
    const admins = await prisma.adminUser.findMany({
      select: { phone: true, name: true },
    });

    const activePhoneNumbers = admins
      .map((a) => a.phone)
      .filter((phone) => Boolean(phone) && phone.trim().length >= 11);

    if (activePhoneNumbers.length === 0) {
      console.warn('⚠️ No admin phone numbers configured for SMS alerts.');
      return;
    }

    const message = `Ealetas Alert: New Order #${orderNumber}! Total: ${totalAmount} BDT. Customer: ${customerName} (${customerPhone}). Check Admin Panel.`;

    for (const phone of activePhoneNumbers) {
      await sendSMS({ number: phone, message });
    }
  } catch (error) {
    console.error('❌ Error sending admin SMS alerts:', error);
  }
}
