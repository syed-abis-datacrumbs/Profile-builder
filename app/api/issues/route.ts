import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserId } from '@/lib/serverAuth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { apiSuccess, apiBadRequest, apiServerError } from '@/lib/apiResponse';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const data = await req.json();
    
    if (!data.text) {
      return apiBadRequest('Text is required');
    }

    let imageUrl = null;
    if (data.imageBase64) {
      // Decode the base64 string
      const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const upload = await uploadToCloudinary(buffer, { folder: 'profile-builder-issues' });
      imageUrl = upload.url;
    }

    const issue = await (db as any).profileBuilderIssue.create({
      data: {
        userId,
        category: data.category || 'resume',
        text: data.text,
        imageUrl,
      },
    });

    return apiSuccess({ success: true, issueId: issue.id });
  } catch (err: any) {
    return apiServerError('Failed to submit issue', err);
  }
}
