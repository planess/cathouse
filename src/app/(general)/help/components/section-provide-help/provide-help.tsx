import Image from 'next/image';

import feedForCatImg from '@public/assets/help/delicates.png';
import catAtHomeImg from '@public/assets/help/home-comfort.png';
import medicineImg from '@public/assets/help/medicine.png';
import educationImg from '@public/assets/help/teach-me.png';

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
        <div className="flex justify-between gap-3">
          <div className="flex-none">
            <Image src={medicineImg} alt="medicine" width={100} />
          </div>

          <div>
            Консультації та допомога з лікуванням: ми допомагаємо знайти
            ветеринарів, покриваємо частину витрат на лікування або стерилізацію
            безпритульних тварин.
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <div className="flex-none">
            <Image src={catAtHomeImg} alt="cat-at-home" width={100} />
          </div>

          <div>
            Прилаштування тварин: ми розміщуємо інформацію про знайдених тварин
            на наших платформах, допомагаємо із пошуком тимчасового або
            постійного дому.
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <div className="flex-none">
            <Image src={feedForCatImg} alt="volunteer" width={100} />
          </div>

          <div>
            Підтримка волонтерів: ми надаємо корм, переноски, медикаменти або
            інші необхідні речі тим, хто тимчасово прихистив тварину.
          </div>
        </div>

        <div className="flex justify-between gap-3">
          <div className="flex-none">
            <Image src={educationImg} alt="knowledge" width={100} />
          </div>

          <div>
            Поширення знань: ми навчаємо, як правильно діяти, якщо ви знайшли
            безпритульну тварину, щоб допомога була ефективною і безпечною.
          </div>
        </div>
      </div>
    </Section>
  );
}
