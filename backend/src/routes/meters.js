import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const metersRouter = Router();

metersRouter.get('/unassigned', requireAuth, requireStaff, async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('meters')
      .select('id, serial_number, location, region')
      .is('consumer_id', null)
      .order('serial_number');
    if (error) throw error;
    res.json(
      (data ?? []).map((m) => ({
        id: m.serial_number,
        uuid: m.id,
        location: m.location,
        region: m.region,
      })),
    );
  } catch (err) {
    next(err);
  }
});

metersRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('meters')
      .select(`
        id, serial_number, display_name, location, region, ward,
        status, battery_pct, signal_strength, grid_lat, grid_lng,
        firmware_version, installation_date, voltage, current_amp, connectivity,
        consumer_id, consumers ( id, full_name, phone, status )
      `)
      .order('serial_number', { ascending: true });

    if (req.profile.role === 'consumer' && req.consumer?.id) {
      query = query.eq('consumer_id', req.consumer.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(
      (data ?? []).map((m) => ({
        id: m.serial_number,
        uuid: m.id,
        name: m.display_name || m.serial_number,
        consumer: m.consumers?.full_name ?? 'Unassigned',
        location: m.location,
        region: m.region,
        status: m.status,
        battery: m.battery_pct,
        signal: m.signal_strength,
        lat: m.grid_lat,
        lng: m.grid_lng,
        firmware: m.firmware_version,
        installation_date: m.installation_date,
        voltage: m.voltage,
        current: m.current_amp,
      })),
    );
  } catch (err) {
    next(err);
  }
});

metersRouter.get('/:serial', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('meters')
      .select(`*, consumers ( full_name )`)
      .eq('serial_number', req.params.serial)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Meter not found' });
      return;
    }
    if (req.profile.role === 'consumer' && data.consumer_id !== req.consumer?.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    res.json({
      id: data.serial_number,
      uuid: data.id,
      consumer: data.consumers?.full_name,
      location: data.location,
      region: data.region,
      status: data.status,
      battery: data.battery_pct,
      signal: data.signal_strength,
      firmware: data.firmware_version,
      installation_date: data.installation_date,
      voltage: data.voltage,
      current: data.current_amp,
    });
  } catch (err) {
    next(err);
  }
});

metersRouter.get('/:serial/readings', requireAuth, async (req, res, next) => {
  try {
    const { data: meter } = await supabaseAdmin
      .from('meters')
      .select('id, consumer_id')
      .eq('serial_number', req.params.serial)
      .maybeSingle();

    if (!meter) {
      res.status(404).json({ error: 'Meter not found' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('readings')
      .select('id, kwh, recorded_at')
      .eq('meter_id', meter.id)
      .order('recorded_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json(data ?? []);
  } catch (err) {
    next(err);
  }
});

metersRouter.post('/', requireAuth, requireStaff, async (req, res, next) => {
  try {
    const { serial_number, location, region, consumer_id, display_name } = req.body;
    if (!serial_number?.trim() || !location?.trim()) {
      res.status(400).json({ error: 'serial_number and location are required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('meters')
      .insert({
        serial_number: serial_number.trim(),
        location: location.trim(),
        region: region?.trim() || 'Central',
        consumer_id: consumer_id || null,
        display_name: display_name?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});
