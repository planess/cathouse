import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Section from './components/section/section';
import ContactForm from './components/contact-form/contact-form';

export default function Help() {
  const t = useTranslations('helppage');

  return (
    <div className="px-6 py-7">
      <h1 className="text-4xl font-bold text-center title my-6">
        {t('title')}
      </h1>

      <div>
        <p className="py-1">
          Ми розуміємо, що не кожен може самостійно впоратись із порятунком,
          лікуванням або прилаштуванням тварин. Саме тому фонд надає підтримку
          людям, які не залишаються байдужими:
        </p>

        <div className="py-1">
          <div>
            Ви не залишаєтесь самі зі складною ситуацією. Ваша допомога стає
            частиною великої системи порятунку. Ви маєте змогу реально вплинути
            на долю тварини, не витрачаючи всі ресурси самотужки.
          </div>
          <p>З нашоъ сторони Ви можете отримати:</p>

          <ul>
            <li>
              🩺 Консультації та допомога з лікуванням: ми допомагаємо знайти
              ветеринарів, покриваємо частину витрат на лікування або
              стерилізацію безпритульних тварин.
            </li>
            <li>
              🐶 Прилаштування тварин: ми розміщуємо інформацію про знайдених
              тварин на наших платформах, допомагаємо із пошуком тимчасового або
              постійного дому.
            </li>
            <li>
              🛠 Підтримка волонтерів: ми надаємо корм, переноски, медикаменти
              або інші необхідні речі тим, хто тимчасово прихистив тварину.
            </li>
            <li>
              📚 Поширення знань: ми навчаємо, як правильно діяти, якщо ви
              знайшли безпритульну тварину, щоб допомога була ефективною і
              безпечною.
            </li>
          </ul>
        </div>

        <p className="py-1">Ми будемо раді усім варіантам допомоги</p>
      </div>

      <div className="flex flex-col gap-4">
        <Section
          title={t('sections.s1-title')}
          text={t('sections.s1-text')}
        ></Section>
        <Section
          title={t('sections.s2-title')}
          text={t('sections.s2-text')}
        ></Section>
      </div>

      <Section>
        <p>
          Будь-яка допомога є відчутною і важливою. Усі професії і навики будуть
          корисні для порятунку тварин, головне бажання.
        </p>

        <p>Ввічливість, легкий пошук спільної мови з оточуючими</p>

        <ContactForm></ContactForm>
      </Section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<unknown>;
}) {
  console.log('-param', await params);
  const t = await getTranslations('helppage');

  return {
    title: `${t('title')} | Perimeter`,
  };
}
