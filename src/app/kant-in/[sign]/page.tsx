import { makeBodySignPage } from '@/components/seo/CosmicBodyPage';

const page = makeBodySignPage('kant-in');

export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.Page;
