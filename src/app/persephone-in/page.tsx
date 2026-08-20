import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('persephone-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
