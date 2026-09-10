import { redirect } from 'next/navigation';

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const params = await searchParams;
  const tool = params?.tool;
  const validTools = ['resume', 'github', 'linkedin', 'jobhunting', 'freelancing', 'interview', 'assistant'];

  if (tool && validTools.includes(tool)) {
    redirect(`/${tool}`);
  }

  redirect('/resume');
}
