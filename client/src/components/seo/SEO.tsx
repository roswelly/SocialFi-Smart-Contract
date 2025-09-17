import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  token?: {
    name: string;
    symbol: string;
    description: string;
    logo: string;
  };
}

const SEO: React.FC<SEOProps> = ({ title, description, image, token }) => {
  const router = useRouter();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://crossfun.xyz';
  const url = `${domain}${router.asPath}`;
  const seoData = {
    title: token ? `${token.name} (${token.symbol}) - CrossFun` : title || 'CrossFun - Explore and Trade Tokens',
    description: token?.description || description || 'Explore, create, and trade tokens on the CrossFun platform',
    image: token?.logo || image || `${domain}/default-og-image.jpg`,
    url: url,
  };

  return (
    <Head>
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
    </Head>
  );
};

export default SEO;