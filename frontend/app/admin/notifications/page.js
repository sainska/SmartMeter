import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default function NotificationsRedirect() {
  redirect(ROUTES.admin.alerts);
}
