import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('toulouse-lautrec-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
