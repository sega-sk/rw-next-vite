import { NextRequest, NextResponse } from 'next/server';

interface LeadAppendices {
  product_id?: string;
  rental_period?: string;
  start_date?: string;
  duration?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  comments?: string;
}

interface LeadCreate {
  form_slug: 'rent_a_product' | 'contact_us';
  appendices: LeadAppendices;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadCreate = await request.json();
    
    // Validate required fields
    if (!body.form_slug || !body.appendices?.first_name || !body.appendices?.last_name || !body.appendices?.email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Make request to external API with server-side API key
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/leads/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.LEADS_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to submit lead' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}