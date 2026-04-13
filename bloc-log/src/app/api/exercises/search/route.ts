import { NextResponse } from 'next/server';

const EXERCISEDB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }
  
  // Try server-side key first, then fall back to public key
  const apiKey = process.env.EXERCISEDB_API_KEY || process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY;
  
  if (!apiKey) {
    console.error('ExerciseDB API key not found in environment variables');
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }
  
  try {
    const headers = {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
    };

    const searchByName = async (term: string) => {
      const response = await fetch(
        `${EXERCISEDB_BASE_URL}/exercises/name/${encodeURIComponent(term)}?limit=20`,
        { headers }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ExerciseDB API error:', response.status, errorText);
        return [];
      }
      const payload = await response.json();
      return Array.isArray(payload) ? payload : [];
    };

    let data = await searchByName(query);

    // Known weak-match terms fallback (e.g. "copenhagen" often misses Copenhagen plank)
    if (data.length === 0 && query.toLowerCase().includes('copenhagen')) {
      const fallback = await searchByName('plank');
      data = fallback.filter((item: { name?: string }) =>
        (item.name || '').toLowerCase().includes('copenhagen')
      );
      if (data.length === 0) {
        data = [
          {
            id: 'custom-copenhagen-plank',
            name: 'copenhagen plank (short lever)',
            bodyPart: 'core',
            target: 'adductors',
            equipment: 'bench',
            gifUrl: '',
            secondaryMuscles: ['obliques'],
            instructions: [],
          },
        ];
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('ExerciseDB API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' }, 
      { status: 500 }
    );
  }
}
