// app/login/change-password/page.jsx

import { Suspense } from 'react';
import ChangePasswordForm from './ChangePasswordForm'; // ✅ default import

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div>Loading password form...</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}