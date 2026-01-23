// src/pages/robots.txt.ts
export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://brun0west.github.io/Brun0West/sitemap-index.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}