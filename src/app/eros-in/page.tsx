import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('eros-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
