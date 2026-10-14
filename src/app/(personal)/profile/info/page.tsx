import { redirect } from 'next/navigation';

import { getProfilePhotoUrl } from '@app/helpers/get-profile-photo-url';
import { getCurrentUser } from '@app/hooks/get-current-user';

import PersonalSection from '../components/personal-section/personal-section';
import SecuritySection from '../components/security-section/security-section';
import VolunteerSection from '../components/volunteer-section/volunteer-section';
import { getVerificationEmailAvailableAt } from '../services/get-verification-email-available-at';

export default async function ProfileInfoPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/signin');
  }

  const verificationAvailableAt = user.emailVerified
    ? null
    : await getVerificationEmailAvailableAt(user.id);

  return (
    <div className="flex flex-col gap-10">
      <PersonalSection
        user={user}
        verificationAvailableAt={verificationAvailableAt}
      />
      {/* `hiredOn` is set only for volunteers */}
      {user.profile.hiredOn && (
        <VolunteerSection
          profile={{ ...user.profile, hiredOn: user.profile.hiredOn }}
          userId={user.id.toString()}
          photoUrl={getProfilePhotoUrl(user.profile.profilePhoto)}
        />
      )}
      <SecuritySection />
    </div>
  );
}
