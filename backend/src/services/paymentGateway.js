import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { buildMockCallback, parseStkCallback } from './mpesa.js';

export async function findPaymentByCheckout(checkoutRequestId) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .select('*')
    .eq('checkout_request_id', checkoutRequestId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function completePayment(payment, { mpesaReceipt, callbackPayload, phone }) {
  const updates = {
    status: 'completed',
    mpesa_receipt: mpesaReceipt ?? payment.mpesa_receipt,
    callback_payload: callbackPayload ?? payment.callback_payload,
    phone: phone ?? payment.phone,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reference_code: mpesaReceipt ? `MPESA-${mpesaReceipt}` : payment.reference_code,
  };

  const { data, error } = await supabaseAdmin
    .from('payments')
    .update(updates)
    .eq('id', payment.id)
    .select()
    .single();
  if (error) throw error;

  if (payment.bill_id) {
    await supabaseAdmin.from('bills').update({ status: 'paid' }).eq('id', payment.bill_id);
    const { data: consumer } = await supabaseAdmin
      .from('consumers')
      .select('outstanding_balance')
      .eq('id', payment.consumer_id)
      .maybeSingle();
    if (consumer) {
      const nextBal = Math.max(0, Number(consumer.outstanding_balance) - Number(payment.amount));
      await supabaseAdmin
        .from('consumers')
        .update({ outstanding_balance: nextBal, updated_at: new Date().toISOString() })
        .eq('id', payment.consumer_id);
    }
  }

  return data;
}

export async function failPayment(payment, reason, callbackPayload) {
  const { data, error } = await supabaseAdmin
    .from('payments')
    .update({
      status: 'failed',
      failure_reason: reason,
      callback_payload: callbackPayload ?? payment.callback_payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function processStkCallback(payload) {
  const parsed = parseStkCallback(payload);
  if (!parsed?.checkoutRequestId) {
    return { ok: false, message: 'Invalid callback payload' };
  }

  const payment = await findPaymentByCheckout(parsed.checkoutRequestId);
  if (!payment) {
    return { ok: false, message: 'Payment not found' };
  }

  if (payment.status === 'completed') {
    return { ok: true, payment, duplicate: true };
  }

  if (parsed.resultCode === 0) {
    const updated = await completePayment(payment, {
      mpesaReceipt: parsed.mpesaReceipt,
      callbackPayload: parsed.raw,
      phone: parsed.phone,
    });
    return { ok: true, payment: updated };
  }

  const failed = await failPayment(payment, parsed.resultDesc, parsed.raw);
  return { ok: true, payment: failed, failed: true };
}

/** Dev/sandbox: auto-complete mock STK after delay */
export function scheduleMockCallback(payment, phone, amount) {
  setTimeout(async () => {
    try {
      const payload = buildMockCallback({
        checkoutRequestId: payment.checkout_request_id,
        merchantRequestId: payment.merchant_request_id,
        amount: Math.ceil(Number(amount)),
        phone,
      });
      await processStkCallback(payload);
    } catch (err) {
      console.error('Mock M-Pesa callback error:', err);
    }
  }, 4000);
}

export function canAccessPayment(req, payment) {
  if (req.isStaff) return true;
  return req.consumer?.id && payment.consumer_id === req.consumer.id;
}

export async function canAccessBill(req, bill) {
  if (req.isStaff) return true;
  return req.consumer?.id && bill.consumer_id === req.consumer.id;
}
