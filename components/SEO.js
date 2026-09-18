import Head from "next/head";

export default function SEO({ title, description, path = "" }) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "SoraPay";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sorapay.vercel.app";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Panel Suntik Sosmed Termurah & Tercepat`;
  const desc =
    description ||
    "SoraPay adalah panel SMM (Social Media Marketing) terpercaya untuk menambah followers, likes, views, dan engagement Instagram, TikTok, YouTube, dan platform lainnya. Proses cepat, harga termurah, order otomatis 24 jam.";
  const url = `${siteUrl}${path}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="keywords" content="SoraPay, suntik sosmed, panel smm, jasa followers, jasa likes, jasa views, tambah followers instagram, tambah subscriber youtube, sosmed murah" />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: siteUrl,
            description: desc,
          }),
        }}
      />
    </Head>
  );
}
