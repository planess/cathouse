import { redirect } from 'next/navigation';

import { PROFILE_SECTIONS } from './models/profile-sections';

export default function ProfilePage() {
  // `/profile` has no content of its own; open the default section
  redirect(`/profile/${PROFILE_SECTIONS[0]}`);
}
