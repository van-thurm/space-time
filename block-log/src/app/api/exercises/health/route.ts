import { NextResponse } from 'next/server';

const EXERCISEDB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

type KeySource = 'EXERCISEDB_API_KEY' | 'NEXT_PUBLIC_EXERCISEDB_API_KEY' | 'none';

function resolveApiKey(): { apiKey: string | undefined; keySource: KeySource } {
  if (process.env.EXERCISEDB_API_KEY) {
    return { apiKey: process.env.EXERCISEDB_API_KEY, keySource: 'EXERCISEDB_API_KEY' };
  }
  if (process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY) {
    return { apiKey: process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY, keySource: 'NEXT_PUBLIC_EXERCISEDB_API_KEY' };
  }
  return { apiKey: undefined, keySource: 'none' };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || 'squat').trim();
  const startedAt = Date.now();

  const { apiKey, keySource } = resolveApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        keySource,
        query,
        reason: 'API key not configured',
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `${EXERCISEDB_BASE_URL}/exercises/name/${encodeURIComponent(query)}?limit=20`,
      {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
        },
        cache: 'no-store',
      }
    );

    const elapsedMs = Date.now() - startedAt;
    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          configured: true,
          keySource,
          query,
          upstreamStatus: response.status,
          elapsedMs,
          reason: 'Upstream request failed',
          upstreamBodyPreview: responseText.slice(0, 300),
        },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(responseText);
    const results = Array.isArray(parsed) ? parsed : [];

    return NextResponse.json({
      ok: true,
      configured: true,
      keySource,
      query,
      upstreamStatus: response.status,
      elapsedMs,
      count: results.length,
      sample: results.slice(0, 5).map((item: { id?: string; name?: string }) => ({
        id: item.id || '',
        name: item.name || '',
      })),
    });
  } catch (error) {
    const err = error as Error & { cause?: { code?: string; message?: string } };
    return NextResponse.json(
      {
        ok: false,
        configured: true,
        keySource,
        query,
        reason: 'Request threw before upstream response',
        error: error instanceof Error ? error.message : 'Unknown error',
        causeCode: err?.cause?.code || null,
        causeMessage: err?.cause?.message || null,
      },
      { status: 502 }
    );
  }
}
