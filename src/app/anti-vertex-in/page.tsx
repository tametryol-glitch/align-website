import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('anti-vertex-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
