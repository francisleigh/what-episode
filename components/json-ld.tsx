/**
 * Renders a schema.org JSON-LD graph as a script tag. Server-rendered so the
 * structured data is in the initial HTML for crawlers — no client JS required.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from our own typed data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
