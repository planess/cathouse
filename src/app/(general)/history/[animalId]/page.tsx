import { ObjectId } from 'mongodb';
import { headers as httpHeaders } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { publishHistoryGranted } from '@app/accessors/publish-history-granted';
import { Sterilized } from '@app/models/db/sterilized';

import {
  buildBadges,
  formatDate,
  resolveAnimalImage,
} from '../components/card/card.helpers';

import AvatarSocialsSection from './components/avatar-socials.section';
import AvatarSection from './components/avatar.section';
import Divider from './components/divider';
import FeatureSection from './components/feature.section';
import { ArrowIcon } from './components/icons';
import InfoSection from './components/info.section';
import ObservationSection from './components/observation.section';
import PublishButton from './components/publish-button';
import TreatmentSection from './components/treatment.section';
import { loadAnimal } from './data';
import { resolveHistoryBackHref } from './resolve-history-back-href';
import { listClinicOptions } from './server/list-clinics';
import { listInformatorOptions } from './server/list-people';
import { sortObservations } from './utils';
import VaccinationSection from './vaccination.section';

import type { ClinicOption, InformatorOption } from './types';

type PageProps = {
  params: {
    animalId: string;
  };
};

export default async function AnimalHistoryPage({ params }: PageProps) {
  const animalId = params.animalId;
  const canEdit = await editHistoryGranted(new ObjectId(animalId));
  const animal = await loadAnimal(params.animalId, canEdit);

  if (!animal) {
    notFound();
  }

  const canPublish = await publishHistoryGranted(animal.createdBy);
  const t = await getTranslations('historypage');
  const headers = await httpHeaders();
  const backHref = resolveHistoryBackHref(headers.get('referer'));
  const heroImage = resolveAnimalImage(
    animal.mainAsset?.key,
    process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
  );
  const heroBadges = buildBadges(animal);
  const createdLabel = formatDate(animal.createdAt);
  const sortedObservations = sortObservations(animal.observations);

  const sterilizedRecord: Sterilized | undefined =
    animal.vetMarkers?.sterilized;
  const isDraft = animal.draft;
  let informatorOptions: InformatorOption[] = [];
  let clinicOptions: ClinicOption[] = [];

  if (canEdit) {
    [informatorOptions, clinicOptions] = await Promise.all([
      listInformatorOptions(),
      listClinicOptions(),
    ]);
  }

  const currentDomain = headers.get('host');
  const currentProtocol = headers.get('x-forwarded-proto') ?? 'https';
  const telegramShareUrl = `${currentProtocol}://${currentDomain}/history/${animal._id.toString()}`;
  const shareText = encodeURIComponent(
    `${animal.name} history at Periphery Foundation`,
  );
  const shareTelegramUrl = `https://t.me/share/url?url=${telegramShareUrl}&text=${shareText}`;
  const shareEmailUrl = `mailto:info@perilines.com.ua?subject=${shareText}`;

  return (
    <div className="bg-slate-50 px-3 py-4 lg:py-5 mx-auto flex max-w-6xl flex-col gap-4">
      <div className="flex justify-between items-center">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowIcon />
          {t('personal.backtohistory')}
        </Link>

        {canPublish && isDraft && (
          <div className="flex gap-4 items-center">
            <PublishButton animalId={animal._id} />
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500 bg-[#F3F4F6] rounded-t-lg">
        <div className="border-t-2 border border-slate-200 rounded-lg bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-4 lg:p-6 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-x-6">
          <div className="hidden lg:block">
            <AvatarSection
              heroImage={heroImage}
              animal={animal}
              canEdit={canEdit}
            />

            <AvatarSocialsSection
              shareTelegramUrl={shareTelegramUrl}
              shareEmailUrl={shareEmailUrl}
            />

            <Divider />

            <ObservationSection
              sortedObservations={sortedObservations}
              animal={animal}
              canEdit={canEdit}
              informatorOptions={informatorOptions}
            />
          </div>

          <div>
            <InfoSection
              informatorOptions={informatorOptions}
              clinicOptions={clinicOptions}
              canEdit={canEdit}
              animal={animal}
              sterilizedRecord={sterilizedRecord}
            />

            <Divider />

            <FeatureSection
              animal={animal}
              sterilizedRecord={sterilizedRecord}
            />

            <div className="lg:hidden mt-6">
              <AvatarSection
                heroImage={heroImage}
                animal={animal}
                canEdit={canEdit}
              />

              <AvatarSocialsSection
                shareTelegramUrl={shareTelegramUrl}
                shareEmailUrl={shareEmailUrl}
              />

              <Divider />

              <ObservationSection
                sortedObservations={sortedObservations}
                animal={animal}
                canEdit={canEdit}
                informatorOptions={informatorOptions}
              />
            </div>

            <Divider />

            <VaccinationSection
              animal={animal}
              canEdit={canEdit}
              clinicOptions={clinicOptions}
            />

            <Divider />

            <TreatmentSection
              canEdit={canEdit}
              clinicOptions={clinicOptions}
              animal={animal}
            />
          </div>
        </div>

        <div className="text-gray-500 px-4 lg:px-6 py-2">
          {t('personal.reference')}: #{animal._id.toString()}
        </div>
      </div>
    </div>
  );
}
