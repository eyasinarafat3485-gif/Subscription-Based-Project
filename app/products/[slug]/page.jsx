import ProductDetailsClient from './ProductDetailsClient';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const formattedTitle = slug
    ? slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Product Details';

  return {
    title: formattedTitle,
    description: `Download ${formattedTitle} on Developers Club.`,
  };
}

export default function ProductPage({ params }) {
  return <ProductDetailsClient params={params} />;
}
