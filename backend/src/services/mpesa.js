import crypto from 'crypto';

const SANDBOX_BASE = 'https://sandbox.safaricom.co.ke';
const LIVE_BASE = 'https://api.safaricom.co.ke';

function mpesaConfig() {
  const env = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox';
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const passkey = process.env.MPESA_PASSKEY;
  const shortcode = process.env.MPESA_SHORTCODE || '174379';
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  const enabled = Boolean(key && secret && passkey && callbackUrl);
  return { env, key, secret, passkey, shortcode, callbackUrl, enabled, base: env === 'production' ? LIVE_BASE : SANDBOX_BASE };
}

export function isMpesaLive() {
  return mpesaConfig().enabled;
}

export function normalizePhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  throw new Error('Enter a valid Kenyan mobile number (e.g. 0712345678)');
}

function lipaPassword(shortcode, passkey) {
  const ts = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14);
  const raw = `${shortcode}${passkey}${ts}`;
  return { password: crypto.createHash('sha256').update(raw).digest('base64'), timestamp: ts };
}

async function getAccessToken(cfg) {
  const auth = Buffer.from(`${cfg.key}:${cfg.secret}`).toString('base64');
  const res = await fetch(`${cfg.base}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.errorMessage || 'M-Pesa OAuth failed');
  return body.access_token;
}

/**
 * Initiate STK push. Returns Daraja response or mock payload when credentials are missing.
 */
export async function initiateStkPush({ phone, amount, accountReference, transactionDesc }) {
  const cfg = mpesaConfig();
  const normalizedPhone = normalizePhone(phone);
  const amt = Math.ceil(Number(amount));
  if (!amt || amt < 1) throw new Error('Invalid payment amount');

  if (!cfg.enabled) {
    const checkoutRequestId = `MOCK-CHK-${Date.now()}`;
    const merchantRequestId = `MOCK-MER-${Date.now()}`;
    return {
      mock: true,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: 'Check your phone to complete payment (sandbox simulation)',
    };
  }

  const token = await getAccessToken(cfg);
  const { password, timestamp } = lipaPassword(cfg.shortcode, cfg.passkey);
  const res = await fetch(`${cfg.base}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: cfg.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amt,
      PartyA: normalizedPhone,
      PartyB: cfg.shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: cfg.callbackUrl,
      AccountReference: String(accountReference).slice(0, 12),
      TransactionDesc: String(transactionDesc || 'SmartMeter bill').slice(0, 13),
    }),
  });

  const body = await res.json();
  if (!res.ok || body.errorCode) {
    throw new Error(body.errorMessage || body.ResponseDescription || 'STK push failed');
  }
  return { mock: false, ...body };
}

/** Parse Safaricom STK callback body */
export function parseStkCallback(payload) {
  const cb = payload?.Body?.stkCallback;
  if (!cb) return null;
  const items = cb.CallbackMetadata?.Item ?? [];
  const meta = {};
  for (const item of items) {
    if (item.Name) meta[item.Name] = item.Value;
  }
  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: Number(cb.ResultCode),
    resultDesc: cb.ResultDesc,
    amount: meta.Amount != null ? Number(meta.Amount) : null,
    mpesaReceipt: meta.MpesaReceiptNumber ?? null,
    phone: meta.PhoneNumber != null ? String(meta.PhoneNumber) : null,
    transactionDate: meta.TransactionDate ?? null,
    raw: payload,
  };
}

/** Simulate successful callback in development when M-Pesa is not configured */
export function buildMockCallback({ checkoutRequestId, merchantRequestId, amount, phone, mpesaReceipt }) {
  return {
    Body: {
      stkCallback: {
        MerchantRequestID: merchantRequestId,
        CheckoutRequestID: checkoutRequestId,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: amount },
            { Name: 'MpesaReceiptNumber', Value: mpesaReceipt || `MOCK${Date.now()}` },
            { Name: 'TransactionDate', Value: Number(new Date().toISOString().replace(/\D/g, '').slice(0, 14)) },
            { Name: 'PhoneNumber', Value: Number(normalizePhone(phone)) },
          ],
        },
      },
    },
  };
}
