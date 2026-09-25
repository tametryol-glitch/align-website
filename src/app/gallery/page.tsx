import { redirect } from 'next/navigation';

// The old gallery wrote to a `media_items` table that never existed. Photos
// now live in the profile album (Profile → Photos tab).
export default function GalleryPage() {
  redirect('/profile?tab=photos');
}
