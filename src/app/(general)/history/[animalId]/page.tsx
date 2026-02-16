import { ObjectId } from 'mongodb';
import { headers as httpHeaders } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { editHistoryGranted } from '@app/accessors/edit-history-granted';
import { publishHistoryGranted } from '@app/accessors/publish-history-granted';
import { composeMetadataTitle, getSiteTitle } from '@app/helpers/metadata';
import { Sterilized } from '@app/models/db/sterilized';

import { resolveAnimalImage } from '../components/card/card.helpers';

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
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{
    animalId: string;
  }>;
};

export default async function AnimalHistoryPage({ params }: PageProps) {
  const { animalId } = await params;

  const animal = await loadAnimal(animalId);

  if (!animal) {
    notFound();
  }

  const canEdit = await editHistoryGranted(animal?.createdBy);

  if (!canEdit && animal.draft) {
    notFound();
  }

  const canPublish = await publishHistoryGranted(animal.createdBy);
  const [t] = await Promise.all([getTranslations('historypage')]);
  const headers = await httpHeaders();
  const backHref = resolveHistoryBackHref(headers.get('referer'));
  const heroImage = resolveAnimalImage(
    animal.mainAsset?.key,
    process.env.CLOUDFLARE_R2_ANIMAL_IMAGE_URL,
  );
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
  const animalIdString = animal._id.toString();
  const telegramShareUrl = `${currentProtocol}://${currentDomain}/history/${animalIdString}`;
  const shareText = encodeURIComponent(
    `${animal.name} history at Periphery Foundation`,
  );
  const shareTelegramUrl = `https://t.me/share/url?url=${telegramShareUrl}&text=${shareText}`;
  const shareEmailUrl = `mailto:info@perilines.com.ua?subject=${shareText}`;

  return (
    <div className="bg-slate-50 px-3 py-4 lg:py-5 mx-auto flex max-w-6xl flex-col gap-4 dark:bg-stone-800 transition-colors">
      <div className="flex justify-between items-center">
        <Link
          href={backHref}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-200"
        >
          <ArrowIcon />
          {t('personal.backtohistory')}
        </Link>

        {canPublish && isDraft && (
          <div className="flex gap-4 items-center">
            <PublishButton animalId={animalIdString} />
          </div>
        )}
      </div>

      <div className="text-sm text-slate-500 bg-[#F3F4F6] rounded-t-lg dark:bg-neutral-600 p-[4px_1px_1px] transition-colors">
        <div className="rounded-lg bg-white dark:bg-neutral-700 dark:shadow-none shadow-[0_25px_80px_rgba(15,23,42,0.08)] p-4 lg:p-6 grid lg:grid-cols-[minmax(0,420px)_1fr] gap-x-6 transition-colors">
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

        <div className="text-gray-500 px-4 lg:px-6 py-2 dark:text-slate-200 transition-colors">
          {t('personal.reference')}: #{animalIdString}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { animalId } = await params;
  const [t, siteTitle] = await Promise.all([
    getTranslations('historypage'),
    getSiteTitle(),
  ]);

  if (!ObjectId.isValid(animalId)) {
    return {
      title: composeMetadataTitle(t('title'), siteTitle),
    };
  }

  const animal = await loadAnimal(animalId);

  if (!animal) {
    return {
      title: composeMetadataTitle(t('title'), siteTitle),
    };
  }

  return {
    title: composeMetadataTitle(animal.name ?? t('title'), siteTitle),
  };
}
