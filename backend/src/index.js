import './loadEnv.js';
import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.js';
import { metersRouter } from './routes/meters.js';
import { consumersRouter } from './routes/consumers.js';
import { dashboardRouter } from './routes/dashboard.js';
import { billsRouter } from './routes/bills.js';
import { alertsRouter } from './routes/alerts.js';
import { operationsRouter } from './routes/operations.js';
import { workOrdersRouter } from './routes/workOrders.js';
import { auditRouter } from './routes/audit.js';
import { paymentsRouter } from './routes/payments.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({ origin: corsOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.SUPABASE_URL ? 'configured' : 'missing-supabase' });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/meters', metersRouter);
app.use('/api/consumers', consumersRouter);
app.use('/api/bills', billsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/operations', operationsRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/audit', auditRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`SmartMeter API running on http://localhost:${PORT}`);
});
