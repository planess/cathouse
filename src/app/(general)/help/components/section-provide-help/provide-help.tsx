import Image from 'next/image';

import feedForCatImg from '@public/assets/help/delicates_transparent.png';
import catAtHomeImg from '@public/assets/help/home-comfort.png';
import medicineImg from '@public/assets/help/medicine_transparent.png';
import educationImg from '@public/assets/help/teach-me_transparent.png';

import Section from '../section/section';

export default function ProvideHelp() {
  return (
    <Section title="Якщо з'явились труднощі">
      <p className="py-1">
        Ми розуміємо, що не кожен може самостійно впоратись із порятунком,
        лікуванням або прилаштуванням тварин. Саме тому фонд надає підтримку
        людям, які не залишаються байдужими
      </p>

      <p className="py-1">
        Ви не залишаєтесь самі зі складною ситуацією. Ваша допомога стає
        частиною великої системи порятунку. Ви маєте змогу реально вплинути на
        долю тварини, не витрачаючи всі ресурси самотужки.
      </p>

      <p>З нашої сторони Ви можете отримати:</p>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-none">
            <Image src={medicineImg} alt="medicine" width={100} />
          </div>

          <div>
            <div className="font-bold">
              Консультації та допомога з лікуванням:
            </div>
            <div>
              допомагаємо знайти ветеринарів, покриваємо частину витрат на
              лікування або стерилізацію безпритульних тварин.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <Image src={catAtHomeImg} alt="cat-at-home" width={100} />
          </div>

          <div>
            <div className="font-bold">Прилаштування тварин:</div>
            <div>
              розміщуємо інформацію про знайдених тварин на наших платформах,
              допомагаємо із пошуком тимчасового або постійного дому.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <Image src={feedForCatImg} alt="volunteer" width={100} />
          </div>

          <div>
            <div className="font-bold">Підтримка волонтерів:</div>
            <div>
              надаємо корм, переноски, медикаменти або інші необхідні речі тим,
              хто тимчасово прихистив тварину.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <Image src={educationImg} alt="knowledge" width={100} />
          </div>

          <div>
            <div className="font-bold">Поширення знань:</div>{' '}
            <div>
              навчаємо, як правильно діяти, якщо ви знайшли безпритульну
              тварину, щоб допомога була ефективною і безпечною.
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
