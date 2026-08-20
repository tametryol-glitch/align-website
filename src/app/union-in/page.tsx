import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('union-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
