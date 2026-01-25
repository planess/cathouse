import OfferNavigation from '@app/components/offer-navigation/offer-navigation';
import { getSiteTitle } from '@app/helpers/metadata';

import {
  AnalyticsIcon,
  CatchIcon,
  CreditCardSecureIcon,
  GavelIcon,
  InfoIcon,
  MealIcon,
  MedicalBoxIcon,
  MedicalKitIcon,
  PaymentBitcoinIcon,
  PetsIcon,
  ReceiptIcon,
  RefundIcon,
  VolunteerHeartIcon,
  WalletMinusIcon,
} from '../history/[animalId]/components/icons';

import { Accordion } from './accordion';
import Section from './section';

import type { Metadata } from 'next';

export default function OfferPage() {
  const navigationItems = [
    { id: 'section1', label: '1. Загальні положення', icon: <InfoIcon /> },
    {
      id: 'section2',
      label: '2. Благодійна пожертва',
      icon: <VolunteerHeartIcon />,
    },
    {
      id: 'section3',
      label: '3. Використання коштів',
      icon: <WalletMinusIcon />,
    },
    {
      id: 'section4',
      label: '4. Використання залишків',
      icon: <PaymentBitcoinIcon />,
    },
    {
      id: 'section5',
      label: '5. Неповернення пожертв',
      icon: <RefundIcon />,
    },
    { id: 'section6', label: '6. Прозорість', icon: <AnalyticsIcon /> },
    {
      id: 'section7',
      label: '7. Конфіденційність',
      icon: <CreditCardSecureIcon />,
    },
    { id: 'section8', label: '8. Заключні положення', icon: <GavelIcon /> },
    { id: 'requisites', label: 'Реквізити', icon: <ReceiptIcon /> },
  ];

  const questions = [
    {
      question: 'Чи можу я отримати звіт про мою пожертву?',
      answer:
        'Так, ми публікуємо щомісячні фінансові звіти на сайті. Також ви можете надіслати запит на нашу пошту для уточнення статусу вашого внеску.',
    },
    {
      question: 'Як скасувати щомісячну підписку?',
      answer:
        'Скасувати регулярний платіж можна через особистий кабінет вашого банку або за посиланням у листі від платіжної системи WayForPay/LiqPay.',
    },
    {
      question: 'Куди йдуть гроші, якщо ціль збору вже закрита?',
      answer:
        'Згідно з п. 4.1 Оферти, надлишкові кошти перенаправляються на інші актуальні потреби статутної діяльності Фонду.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-8 transition-[padding]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div className="space-y-3">
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl md:text-4xl font-bold tracking-tight transition-colors">
            Публічна оферта
          </h1>
          <p className="text-slate-600 dark:text-slate-200 text-base transition-colors">
            Благодійний фонд «Периферія» — системна допомога безпритульним
            тваринам (TNR).
          </p>
        </div>
        {/* <button className="flex items-center gap-2 min-w-[160px] cursor-pointer justify-center rounded-xl h-12 px-5 bg-white dark:bg-[#1c2636] border border-[#e7ebf4] dark:border-[#2d3a52] text-[#0d121c] dark:text-white text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-[#253247] transition-all">
          <span className="material-symbols-outlined text-xl">download</span>
          <span>Завантажити PDF</span>
        </button> */}
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:block lg:w-1/3 ">
          <div className="sticky top-18">
            <OfferNavigation
              title="Зміст документа"
              subtitle="Останнє оновлення: 01 листопада 2024"
              items={navigationItems}
            />
          </div>
        </aside>

        <article className="lg:w-2/3 space-y-12 pb-20">
          <section className="scroll-mt-28" id="section1">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              1. Загальні положення
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                <strong>1.1.</strong> Ця Публічна оферта (надалі — «Оферта») є
                офіційною пропозицією Благодійного фонду «Периферія» (надалі —
                «Фонд»), в особі директора, що діє на підставі Статуту, укласти
                Договір про надання добровільної благодійної пожертви.
              </p>
              <p>
                <strong>1.2.</strong> Оферта діє відповідно до Закону України
                «Про благодійну діяльність та благодійні організації» та
                Цивільного кодексу України.
              </p>
              <p>
                <strong>1.3.</strong> Акцептом (прийняттям) Оферти є
                перерахування коштів на банківський рахунок Фонду за допомогою
                платіжних систем на сайті або за реквізитами. Момент зарахування
                коштів вважається моментом укладення Договору.
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section2">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              2. Благодійна пожертва
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                <strong>2.1.</strong> Благодійна пожертва є добровільною та не
                передбачає отримання Благодійником будь-якої матеріальної вигоди
                чи винагороди.
              </p>
              <p>
                <strong>2.2.</strong> Метою пожертви є фінансування статутної
                діяльності Фонду, спрямованої на гуманне регулювання чисельності
                безпритульних тварин шляхом стерилізації (програма TNR),
                лікування, перетримку та соціалізацію котів.
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section3">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              3. Типи рахунків та використання коштів
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#0d121c] dark:text-white">
                  3.1. Загальний рахунок
                </h3>
                <p>
                  Кошти, що надходять на загальний рахунок Фонду без зазначення
                  конкретної мети, використовуються для забезпечення
                  безперебійної роботи організації та покриття першочергових
                  потреб.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#0d121c] dark:text-white">
                  3.2. Цільові рахунки та потреби
                </h3>
                <p>
                  Фонд може відкривати збори на конкретні цілі, кошти з яких
                  спрямовуються на:
                </p>
                <ul className="space-y-3 list-none">
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <CatchIcon />
                    </span>
                    <span>
                      <strong>Вилов та логістика:</strong> Придбання обладнання
                      для гуманного відлову та оплата транспортування тварин.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <PetsIcon />
                    </span>
                    <span>
                      <strong>Стерилізація та кастрація:</strong> Оплата послуг
                      ветеринарних клінік для проведення операцій.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <MedicalKitIcon />
                    </span>
                    <span>
                      <strong>Лікування та вакцинація:</strong> Купівля
                      медикаментів, оплата стаціонару та профілактичних щеплень.
                    </span>
                  </li>
                  <li className="flex items-start gap-4">
                    <span className="size-8 flex-none text-indigo-400">
                      <MealIcon />
                    </span>
                    <span>
                      <strong>Харчування:</strong> Закупівля якісного корму для
                      тварин, що перебувають на перетримці або під наглядом
                      волонтерів на вулиці.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="scroll-mt-28" id="section4">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              4. Використання залишків
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                <strong>4.1.</strong> Якщо сума цільового збору перевищує
                необхідну суму для конкретного проекту, залишок коштів
                перераховується на загальний рахунок Фонду.
              </p>
              <p>
                <strong>4.2.</strong> Ці кошти використовуються для реалізації
                інших актуальних проектів Фонду або на термінові випадки
                допомоги тваринам.
              </p>
              <p>
                <strong>4.3.</strong> У разі неможливості реалізації цільового
                проекту з незалежних від Фонду причин, зібрані кошти
                перенаправляються на аналогічні потреби статутної діяльності.
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section5">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              5. Неповернення пожертв
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <div className="bg-[#256af4]/5 border-l-4 border-[#256af4] p-5 rounded-r-lg">
                <p className="font-medium">
                  <strong>5.1.</strong> Відповідно до чинного законодавства,
                  благодійна пожертва є безповоротною допомогою і не підлягає
                  поверненню Благодійнику.
                </p>
              </div>
              <p>
                <strong>5.2.</strong> Здійснюючи платіж, Благодійник
                підтверджує, що він ознайомлений з умовами цієї Оферти та
                усвідомлює безповоротний характер внеску.
              </p>
              <p>
                <strong>5.3.</strong> Винятки можливі лише у випадках технічних
                помилок платіжних систем (подвійне списання), що підтверджується
                відповідними виписками банку.
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section6">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              6. Прозорість та підтримка
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                Ми віримо у системний підхід. Ваша підтримка дозволяє нам
                планувати роботу на місяці вперед. Кожна гривня — це крок до
                міста, де немає безпритульних тварин, а лише здорові та щасливі
                коти у своїх домівках або безпечному середовищі.
              </p>
              <p>
                Фонд щомісяця публікує детальні звіти про надходження та витрати
                у відповідному розділі нашого сайту.
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section7">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              7. Конфіденційність
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                Благодійник надає згоду на обробку своїх персональних даних
                (ім&#39;я, прізвище, електронна адреса, платіжні реквізити) для
                забезпечення процесу перерахування пожертви та ведення обліку.
                Фонд гарантує захист даних згідно із Законом України «Про захист
                персональних даних».
              </p>
            </div>
          </section>

          <section className="scroll-mt-28" id="section8">
            <h2 className="text-2xl font-bold mb-4 text-[#0d121c] dark:text-white">
              8. Заключні положення
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-[#49659c] dark:text-[#a1b2d3] leading-relaxed space-y-4">
              <p>
                Фонд має право вносити зміни до цієї Оферти без попереднього
                повідомлення. Нова редакція набирає чинності з моменту її
                публікації на сайті. Усі спори, що виникають у зв&#39;язку з
                виконанням цього Договору, вирішуються шляхом переговорів або
                згідно з законодавством України.
              </p>
            </div>
          </section>

          <Section title="Реквізити Фонду" id="requisites">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-[#49659c] dark:text-[#a1b2d3]">
              <div className="space-y-2">
                <p className="font-bold text-[#0d121c] dark:text-white">
                  Повна назва:
                </p>
                <p>Благодійна Організація «Благодійний фонд «Периферія»»</p>
                <p className="font-bold text-[#0d121c] dark:text-white mt-4">
                  ЄДРПОУ:
                </p>
                <p>45962629</p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-[#0d121c] dark:text-white">
                  Юридична адреса:
                </p>
                <p>79048, Україна, м. Львів, вул. Павла Думанського, 27</p>
                <p className="font-bold text-[#0d121c] dark:text-white mt-4">
                  Email для зв&#39;язку:
                </p>
                <p>
                  <a href="mailto:info@perilines.com.ua">
                    info@perilines.com.ua
                  </a>
                </p>
              </div>
            </div>
          </Section>

          <Accordion items={questions} title={'Поширені питання (FAQ)'} />
        </article>
      </div>
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const siteTitle = await getSiteTitle();

  return {
    title: `Публічна оферта | ${siteTitle}`,
  };
}
