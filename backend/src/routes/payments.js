import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth } from '../middleware/auth.js';
import { initiateStkPush, isMpesaLive, normalizePhone } from '../services/mpesa.js';
import { buildInvoicePdf, buildReceiptPdf } from '../services/pdfDocuments.js';
import {
  canAccessBill,
  canAccessPayment,
  completePayment,
  processStkCallback,
  scheduleMockCallback,
} from '../services/paymentGateway.js';

export const paymentsRouter = Router();

/** Safaricom Daraja STK callback — no auth */
paymentsRouter.post('/callback', async (req, res, next) => {
  try {
    const result = await processStkCallback(req.body);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    if (!result.ok) console.warn('STK callback:', result.message);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post('/stk-push', requireAuth, async (req, res, next) => {
  try {
    const consumerId = req.consumer?.id;
    if (!consumerId) {
      res.status(400).json({ error: 'No consumer account linked to this user' });
      return;
    }

    const { bill_id, phone, amount } = req.body;
    let bill = null;
    if (bill_id) {
      const { data, error } = await supabaseAdmin.from('bills').select('*').eq('id', bill_id).maybeSingle();
      if (error) throw error;
      if (!data) {
        res.status(404).json({ error: 'Bill not found' });
        return;
      }
      if (data.consumer_id !== consumerId) {
        res.status(403).json({ error: 'Bill does not belong to your account' });
        return;
      }
      if (data.status === 'paid') {
        res.status(400).json({ error: 'This invoice is already paid' });
        return;
      }
      bill = data;
    }

    const payPhone = phone || req.consumer?.phone;
    if (!payPhone) {
      res.status(400).json({ error: 'Phone number is required for M-Pesa STK push' });
      return;
    }

    const payAmount = Number(amount) || Number(bill?.amount);
    if (!payAmount || payAmount <= 0) {
      res.status(400).json({ error: 'Invalid payment amount' });
      return;
    }

    const normalized = normalizePhone(payPhone);
    const accountRef = bill?.invoice_number || bill?.id?.slice(0, 8) || consumerId;

    const stk = await initiateStkPush({
      phone: normalized,
      amount: payAmount,
      accountReference: accountRef,
      transactionDesc: 'Electric bill',
    });

    const ref = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const { data: payment, error: insertErr } = await supabaseAdmin
      .from('payments')
      .insert({
        consumer_id: consumerId,
        bill_id: bill_id || null,
        amount: payAmount,
        method: 'M-Pesa',
        reference_code: ref,
        status: 'pending',
        phone: normalized,
        checkout_request_id: stk.CheckoutRequestID,
        merchant_request_id: stk.MerchantRequestID,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    if (stk.mock) {
      scheduleMockCallback(payment, normalized, payAmount);
    }

    res.status(201).json({
      payment_id: payment.id,
      status: 'pending',
      checkout_request_id: stk.CheckoutRequestID,
      merchant_request_id: stk.MerchantRequestID,
      customer_message: stk.CustomerMessage,
      mock_mode: stk.mock === true,
      mpesa_live: isMpesaLive(),
    });
  } catch (err) {
    next(err);
  }
});

/** Manual payment (bank, card, airtel) — immediate completion */
paymentsRouter.post('/manual', requireAuth, async (req, res, next) => {
  try {
    const consumerId = req.consumer?.id;
    if (!consumerId) {
      res.status(400).json({ error: 'No consumer account linked' });
      return;
    }

    const { amount, method, bill_id } = req.body;
    const allowed = ['M-Pesa', 'Airtel Money', 'Bank', 'Card'];
    const payMethod = allowed.includes(method) ? method : 'Bank';

    const ref = `PAY-${Date.now().toString(36).toUpperCase()}`;
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .insert({
        consumer_id: consumerId,
        bill_id: bill_id || null,
        amount: Number(amount),
        method: payMethod,
        reference_code: ref,
        status: 'processing',
      })
      .select()
      .single();

    if (error) throw error;

    const completed = await completePayment(payment, { mpesaReceipt: null, callbackPayload: { manual: true } });
    res.status(201).json({
      payment_id: completed.id,
      status: completed.status,
      reference_code: completed.reference_code,
    });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/bills/:billId/invoice.pdf', requireAuth, async (req, res, next) => {
  try {
    const { data: bill, error } = await supabaseAdmin
      .from('bills')
      .select('*')
      .eq('id', req.params.billId)
      .maybeSingle();

    if (error) throw error;
    if (!bill) {
      res.status(404).json({ error: 'Bill not found' });
      return;
    }
    if (!(await canAccessBill(req, bill))) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data: consumer } = await supabaseAdmin
      .from('consumers')
      .select('*')
      .eq('id', bill.consumer_id)
      .maybeSingle();

    const pdf = await buildInvoicePdf({ bill, consumer });
    const fname = bill.invoice_number || bill.id;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${fname}.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('id, status, amount, method, reference_code, mpesa_receipt, failure_reason, bill_id, paid_at, updated_at')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    if (!canAccessPayment(req, payment)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      method: payment.method,
      reference_code: payment.reference_code,
      mpesa_receipt: payment.mpesa_receipt,
      failure_reason: payment.failure_reason,
      bill_id: payment.bill_id,
      paid_at: payment.paid_at,
    });
  } catch (err) {
    next(err);
  }
});

paymentsRouter.get('/:id/receipt.pdf', requireAuth, async (req, res, next) => {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!payment) {
      res.status(404).json({ error: 'Payment not found' });
      return;
    }
    if (!canAccessPayment(req, payment)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (payment.status !== 'completed') {
      res.status(400).json({ error: 'Receipt available only for completed payments' });
      return;
    }

    let bill = null;
    if (payment.bill_id) {
      const { data } = await supabaseAdmin.from('bills').select('*').eq('id', payment.bill_id).maybeSingle();
      bill = data;
    }

    const { data: consumer } = await supabaseAdmin
      .from('consumers')
      .select('*')
      .eq('id', payment.consumer_id)
      .maybeSingle();

    const pdf = await buildReceiptPdf({ payment, bill, consumer });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.reference_code}.pdf"`);
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});
