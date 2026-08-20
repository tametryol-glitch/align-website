import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('part-of-fortune-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
