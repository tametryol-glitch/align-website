import { makeBodyIndexPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodyIndexPage('echo-in');

export const generateMetadata = page.generateMetadata;
export default page.Page;
