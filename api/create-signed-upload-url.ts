

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../lib/database.types';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Origin', '*'); // In production, restrict this to your domain
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return response.status(200).end();
  }
  
  // Set CORS header for the actual request
  response.setHeader('Access-Control-Allow-Origin', '*'); // In production, restrict this to your domain

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fileName, fileType } = request.body;
    if (!fileName || !fileType) {
        return response.status(400).json({ message: 'fileName and fileType are required.' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return response.status(500).json({ message: 'Supabase server configuration is incomplete.' });
    }
    
    // In a real app, you'd want to validate the user's session here
    // to ensure only authenticated admins can get upload URLs.

    const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Sanitize file name to prevent path traversal or other attacks
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const path = `public/${Date.now()}-${sanitizedFileName}`;

    const { data, error } = await supabaseAdmin.storage
        .from('vehicle-images') // Corrected bucket name
        .createSignedUploadUrl(path);

    if (error) {
        console.error('Supabase signed URL error:', error);
        throw new Error('Could not create signed URL.');
    }

    return response.status(200).json({ signedUrl: data.signedUrl, path: data.path });

  } catch (error: any) {
    console.error('Error in create-signed-upload-url handler:', error);
    return response.status(500).json({ message: 'Error creating signed upload URL.', details: error.message });
  }
}