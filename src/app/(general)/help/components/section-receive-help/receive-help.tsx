import ContactFormWrapper from '../contact-form-wrapper/contact-form-wrapper';
import Section from '../section/section';

export default function ReceiveHelp() {
  return (
    <Section title="Долучитись до підтримки">
      <p className="py-1">
        Будь-яка допомога є відчутною і важливою. Чим більше людей допомагають -
        тим менше навантаження на кожного. І саме на це ми хочемо зосередити увагу!
      </p>

      <div className="py-1">
        <p>Найактуальніші потреби:</p>

        <ul>
          <li>
            Оперативне спостереження: пошук та нагляд за зонами проживання
            тварин
          </li>
          <li>Оперативна активність: вилов і транспортування тварин</li>
          <li>Медична сфера: огляд і лікування тварин (тільки з освітою)</li>
          <li>
            IT-сфера: бізнес-аналітика, розробка frontend/backend (javascript),
            дизайн
          </li>
          <li>
            Догляд і опіка: якщо є можливість перетримати безпритульних тварин у
            власному помешканні (засоби та їжі надаємо)
          </li>
        </ul>
      </div>

      <p className="py-1">
        Повідомте які знання чи вміння можете надати, і ми зв&apos;яжемося з
        Вами ❤️
      </p>

      <ContactFormWrapper />
    </Section>
  );
}
