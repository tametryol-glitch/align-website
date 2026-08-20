import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('medea-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
