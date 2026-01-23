// src/pages/robots.txt.ts
export async function GET() {
  const robotsTxt = `
User-agent: *
Allow: /

Sitemap: https://Brun0West.github.io/Brun0West/sitemap.xml
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}