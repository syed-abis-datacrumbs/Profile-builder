import { currentUser } from '@clerk/nextjs/server';
import { WorkspaceProvider, InitialUser } from '../../context/WorkspaceContext';
import { WorkspaceShell } from '../../components/WorkspaceShell';

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  const initialUser: InitialUser | null = user
    ? {
        id: user.id,
        firstName:
          user.firstName ||
          user.fullName?.split(' ')[0] ||
          user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
          '',
        fullName: (
          user.fullName ||
          [user.firstName, user.lastName].filter(Boolean).join(' ') ||
          ''
        ).trim(),
        email: user.primaryEmailAddress?.emailAddress,
      }
    : null;

  return (
    <WorkspaceProvider initialUser={initialUser}>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceProvider>
  );
}
