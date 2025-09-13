export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      contributions: '/api/github/{username}',
      years: '/api/github/{username}/years',
      specific_year: '/api/github/{username}?year={year}',
      nested_format: '/api/github/{username}?format=nested'
    }
  });
}
