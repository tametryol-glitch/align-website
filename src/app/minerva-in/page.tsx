import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('minerva-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
