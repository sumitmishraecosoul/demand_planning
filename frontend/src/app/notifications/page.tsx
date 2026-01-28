'use client';

import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotificationList from '@/components/NotificationList';

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="max-w-4xl mx-auto">
          <NotificationList />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
