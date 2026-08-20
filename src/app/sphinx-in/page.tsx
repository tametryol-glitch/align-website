import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('sphinx-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
