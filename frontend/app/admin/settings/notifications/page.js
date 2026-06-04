'use client';

import { redirect } from 'next/navigation';

export default function SettingsNotificationsRedirect() {
  redirect('/admin/notifications');
}
