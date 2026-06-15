// Extract plain text from the supported knowledge sources: PDF, plain text /
// markdown, pasted text, and web pages.

export interface ParsedSource {
  title: string;
  text: string;
}

function stripExtension(name: string): string {
  return name.replace(/\.[^.]+$/, "").trim() || name;
}

export async function parsePdf(
  data: ArrayBuffer,
  filename: string,
): Promise<ParsedSource> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { text } = await extractText(pdf, { mergePages: true });
  return {
    title: stripExtension(filename),
    text: Array.isArray(text) ? text.join("\n\n") : text,
  };
}

export function parsePlainText(content: string, filename: string): ParsedSource {
  return { title: stripExtension(filename), text: content };
}

export async function parseUrl(url: string): Promise<ParsedSource> {
  const res = await fetch(url, {
    headers: { "user-agent": "DocentBot/1.0 (+knowledge ingestion)" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Could not fetch the page (HTTP ${res.status}).`);
  }

  const html = await res.text();
  const { load } = await import("cheerio");
  const $ = load(html);
  $("script, style, noscript, nav, footer, header, svg, iframe, form").remove();

  const title =
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    url;

  const text = $("main").text().trim() || $("body").text();
  const cleaned = text
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { title, text: cleaned };
}
