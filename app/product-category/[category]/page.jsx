import CategoryClient from './CategoryClient';

const CATEGORY_MAP = {
  'wordpress-plugins': 'WordPress Plugins',
  'wordpress-themes': 'WordPress Themes',
  'seo-tools': 'SEO Tools',
  'landing-pages': 'Landing Pages',
  'resources': 'WordPress Resources',
};

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawCategorySlug = resolvedParams?.category || '';
  const title = CATEGORY_MAP[rawCategorySlug] || 
    (rawCategorySlug ? rawCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All Products');
  
  return {
    title: title,
    description: `Explore top ${title} on Developers Club.`,
  };
}

export default function CategoryPage({ params }) {
  return <CategoryClient params={params} />;
}
