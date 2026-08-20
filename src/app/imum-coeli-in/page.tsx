import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('imum-coeli-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
