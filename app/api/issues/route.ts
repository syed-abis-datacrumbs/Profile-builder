import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/serverAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const data = await req.json();
    
    if (!data.text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let imageUrl = null;
    if (data.imageBase64) {
      // Decode the base64 string
      const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const upload = await uploadToCloudinary(buffer, { folder: 'profile-builder-issues' });
      imageUrl = upload.url;
    }

    const issue = await db.profileBuilderIssue.create({
      data: {
        userId,
        text: data.text,
        imageUrl,
      },
    });

    return NextResponse.json({ success: true, issueId: issue.id });
  } catch (err: any) {
    console.error('Failed to submit issue:', err);
    return NextResponse.json({ error: 'Failed to submit issue' }, { status: 500 });
  }
}
