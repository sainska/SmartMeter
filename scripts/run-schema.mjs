import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const schemaPath = path.join(root, 'supabase', 'schema.sql');
const migrationsDir = path.join(root, 'supabase', 'migrations');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile(path.join(root, 'backend', '.env'));
loadEnvFile(path.join(root, '.env'));

const password = process.env.SUPABASE_DB_PASSWORD;
const projectRef = process.env.SUPABASE_PROJECT_REF || 'yerwxvhgsqjermnzfqov';

if (!password) {
  console.error('Set SUPABASE_DB_PASSWORD (Supabase → Settings → Database → password).');
  console.error('  PowerShell: $env:SUPABASE_DB_PASSWORD = "your-password"; npm run db:push');
  process.exit(1);
}

const hosts = [
  `db.${projectRef}.supabase.co`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-0-eu-central-1.pooler.supabase.com`,
  `aws-0-ap-southeast-1.pooler.supabase.com`,
];

async function tryConnect(host, port, user) {
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });
  await client.connect();
  return client;
}

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists public.schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    );
  `);
}

async function appliedMigrations(client) {
  const { rows } = await client.query('select name from public.schema_migrations order by name');
  return new Set(rows.map((r) => r.name));
}

async function runFile(client, name, sql) {
  console.log(`Applying ${name}...`);
  await client.query(sql);
  await client.query('insert into public.schema_migrations (name) values ($1) on conflict do nothing', [name]);
  console.log(`  OK: ${name}`);
}

let client;
let usedHost;

for (const host of hosts) {
  const isPooler = host.includes('pooler');
  const user = isPooler ? `postgres.${projectRef}` : 'postgres';
  const port = isPooler ? 6543 : 5432;
  try {
    console.log(`Trying ${host}:${port} as ${user}...`);
    client = await tryConnect(host, port, user);
    usedHost = host;
    break;
  } catch (err) {
    console.log(`  -> ${err.message}`);
  }
}

if (!client) {
  console.error('\nCould not connect. Run SQL manually in Supabase SQL Editor.');
  process.exit(1);
}

try {
  console.log(`Connected via ${usedHost}`);
  await ensureMigrationsTable(client);
  const done = await appliedMigrations(client);

  if (!done.has('schema.sql')) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await runFile(client, 'schema.sql', sql);
  } else {
    console.log('Skip schema.sql (already applied)');
  }

  if (fs.existsSync(migrationsDir)) {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const key = `migrations/${file}`;
      if (done.has(key)) {
        console.log(`Skip ${key} (already applied)`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await runFile(client, key, sql);
    }
  }

  const { rows } = await client.query(`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);
  console.log('Tables:', rows.map((r) => r.table_name).join(', '));
  const meters = await client.query('select count(*)::int as n from public.meters');
  const consumers = await client.query('select count(*)::int as n from public.consumers');
  console.log(`Seed: ${meters.rows[0].n} meters, ${consumers.rows[0].n} consumers`);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
