'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/AppShell';
import { Card, Button, Input, InputGroup, Badge } from '@/components/ui';
import { DataLoading } from '@/components/ui/DataState';
import { useLiveData } from '@/hooks/useLiveData';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import styles from '@/components/layout/layout.module.css';
import { ROUTES } from '@/lib/routes';

const METHODS = ['M-Pesa', 'Airtel Money', 'Bank', 'Card'];

export default function PaymentsPage() {
  const [method, setMethod] = useState('M-Pesa');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [phase, setPhase] = useState('idle');
  const [paymentId, setPaymentId] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);
  const router = useRouter();
  const { profile, consumer } = useAuth();
  const { data: bills, loading, reload: reloadBills } = useLiveData(() => api.bills(), ['bills']);
  const { data: payments, reload: reloadPayments } = useLiveData(() => api.payments(), ['payments']);

  const unpaid = (bills ?? []).find((b) => b.status === 'unpaid');

  useEffect(() => {
    if (consumer?.phone) setPhone(consumer.phone);
    else if (profile?.phone) setPhone(profile.phone);
  }, [consumer?.phone, profile?.phone]);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startPolling = (id) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const st = await api.paymentStatus(id);
        if (st.status === 'completed') {
          clearInterval(pollRef.current);
          setPhase('success');
          setStatusMsg(st.mpesa_receipt ? `M-Pesa: ${st.mpesa_receipt}` : 'Payment completed');
          reloadBills();
          reloadPayments();
        } else if (st.status === 'failed') {
          clearInterval(pollRef.current);
          setPhase('failed');
          setError(st.failure_reason || 'Payment failed');
        } else {
          setStatusMsg('Waiting for M-Pesa confirmation on your phone…');
        }
      } catch {
        /* keep polling */
      }
    }, 2500);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setPhase('submitting');

    try {
      const payAmount = Number(amount) || unpaid?.amount;
      if (!payAmount) throw new Error('Enter an amount');

      if (method === 'M-Pesa') {
        if (!phone.trim()) throw new Error('Enter your M-Pesa phone number');
        const res = await api.stkPush({
          bill_id: unpaid?.id,
          phone: phone.trim(),
          amount: payAmount,
        });
        setPaymentId(res.payment_id);
        setPhase('pending');
        setStatusMsg(
          res.mock_mode
            ? 'Sandbox mode: accept the simulated prompt (auto-completes in a few seconds)'
            : res.customer_message || 'Check your phone for the M-Pesa prompt',
        );
        startPolling(res.payment_id);
        return;
      }

      const manual = await api.payManual({
        amount: payAmount,
        method,
        bill_id: unpaid?.id,
      });
      setPaymentId(manual.payment_id);
      setPhase('success');
      setStatusMsg(`${method} payment recorded — ref ${manual.reference_code}`);
      reloadBills();
      reloadPayments();
    } catch (err) {
      setPhase('idle');
      setError(err.message);
    }
  };

  const handleDownloadReceipt = async (id) => {
    try {
      await api.downloadReceiptPdf(id);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <DataLoading />;

  return (
    <>
      <PageHeader title="Payments" description="M-Pesa STK push, receipts, and other methods" />

      <form onSubmit={handlePay}>
        <Card title="Pay bill">
          {unpaid && (
            <p className="text-sm text-muted" style={{ marginBottom: 12 }}>
              Outstanding: {unpaid.currency ?? 'KES'} {Number(unpaid.amount).toLocaleString()} (
              {unpaid.period})
              {unpaid.invoice_number && ` · ${unpaid.invoice_number}`}
            </p>
          )}

          <div className={styles.splitAuth} style={{ marginBottom: 16 }}>
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                className={method === m ? styles.splitActive : ''}
                onClick={() => {
                  setMethod(m);
                  setPhase('idle');
                  setError('');
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {method === 'M-Pesa' && (
            <InputGroup label="M-Pesa phone" id="phone">
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                required
              />
            </InputGroup>
          )}

          <div style={{ marginTop: 12 }}>
            <InputGroup label="Amount (KES)" id="amount">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={unpaid ? String(unpaid.amount) : '0'}
              />
            </InputGroup>
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--color-danger)', marginTop: 12 }}>
              {error}
            </p>
          )}
          {phase === 'pending' && (
            <Badge variant="warning" style={{ marginTop: 12, display: 'block' }}>
              {statusMsg}
            </Badge>
          )}
          {phase === 'success' && (
            <Badge variant="success" style={{ marginTop: 12, display: 'block' }}>
              {statusMsg}
            </Badge>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              type="submit"
              disabled={phase === 'submitting' || phase === 'pending' || phase === 'success'}
            >
              {phase === 'submitting'
                ? 'Processing…'
                : phase === 'pending'
                  ? 'Awaiting M-Pesa…'
                  : method === 'M-Pesa'
                    ? 'Send STK push'
                    : `Pay with ${method}`}
            </Button>
            {phase === 'success' && paymentId && (
              <Button type="button" variant="secondary" onClick={() => handleDownloadReceipt(paymentId)}>
                Download receipt (PDF)
              </Button>
            )}
            {phase === 'success' && (
              <Button type="button" variant="ghost" onClick={() => router.push(ROUTES.consumer.bills)}>
                View bills
              </Button>
            )}
          </div>
        </Card>
      </form>

      <div style={{ marginTop: 16 }}>
        <Card title="Recent payments">
          {(payments ?? []).length === 0 ? (
            <p className="text-sm text-muted">No payments recorded yet.</p>
          ) : (
            (payments ?? []).slice(0, 8).map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 10,
                  flexWrap: 'wrap',
                }}
              >
                <p className="text-sm text-muted" style={{ margin: 0 }}>
                  {p.amount_label ?? `KES ${p.amount}`} via {p.method} — {p.ref}
                  {p.mpesa_receipt && ` (${p.mpesa_receipt})`}
                  <br />
                  <span className="text-xs">{p.date} · {p.status}</span>
                </p>
                {p.status === 'completed' && (
                  <Button type="button" variant="ghost" sm onClick={() => handleDownloadReceipt(p.id)}>
                    Receipt PDF
                  </Button>
                )}
              </div>
            ))
          )}
        </Card>
      </div>
    </>
  );
}
