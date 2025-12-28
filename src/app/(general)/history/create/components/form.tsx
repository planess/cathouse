'use client';

import { useRouter } from 'next/navigation';
import { FormEvent } from 'react';
import { useForm } from 'react-hook-form';

import RadioField from '@app/(general)/history/components/radio-field/radio-field';
import InputField from '@app/(guest)/components/input-field/input-field';
import { Button } from '@app/components/button';
import { AnimalSex, animalSpeciesList } from '@app/models/animal';
import type { AnimalSpecies } from '@app/models/animal';

import CustomField from '../../components/custom-field/custom-field';
import SelectorField from '../../components/selector-field/selector-field';
import { saveAnimal } from '../../server/save-animal';

type AnimalFormFields = {
  name: string;
  chipid?: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  description?: string;
  informator: string;
  birthdate?: string;
  image?: FileList;
};

const speciesOptions = animalSpeciesList.map((species) => ({
  value: species,
  label: species.charAt(0).toUpperCase() + species.slice(1),
}));

const sexOptions = Object.values(AnimalSex).map((sex) => ({
  value: sex,
  label: sex.charAt(0).toUpperCase() + sex.slice(1),
}));

export default function Form() {
  const { register, handleSubmit } = useForm<AnimalFormFields>();
  const router = useRouter();

  const onSubmit = handleSubmit(async (data) => {
    // validation

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          if (typeof value === 'string' && value.trim() !== '') {
            formData.append(key, value.trim());
          } else if (typeof value === 'number') {
            formData.append(key, value);
          } else if (value instanceof FileList && value.length > 0) {
            [...value].forEach((file) => formData.append(key, file));
          }
        }
      }

      const response = await saveAnimal(formData);

      if (!response.success) {
        throw new Error(response.error);
      }

      router.push(`/history/${response.animalId}`);
    } catch (error) {
      console.error(error);
    }
  });

  const silentSubmit = (event: FormEvent<HTMLFormElement>) =>
    void onSubmit(event);

  return (
    <form
      onSubmit={silentSubmit}
      className="flex flex-col gap-3"
      encType="multipart/form-data"
    >
      <div>
        <InputField
          label="Name"
          element="input"
          config={{
            ...register('name', { required: true }),
            placeholder: 'Fluffy',
          }}
        />
      </div>

      <div>
        <SelectorField
          label="Sex"
          config={{ ...register('sex', { required: true }) }}
          options={sexOptions}
        />
      </div>

      <div>
        <SelectorField
          label="Species"
          config={{ ...register('species', { required: true }) }}
          options={speciesOptions}
        />
      </div>

      <div>
        <InputField
          label="Description"
          element="textarea"
          config={{
            ...register('description'),
            placeholder: 'A brief description of the animal',
            rows: 4,
          }}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <SelectorField
            label="Informator"
            config={{ ...register('informator') }}
            options={[]}
          />
        </div>

        <Button>Add new</Button>
      </div>

      <Button>Save draft</Button>
    </form>
  );
}
