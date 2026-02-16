'use client';

import { useTranslations } from 'next-intl';

export type IbanCardItem = {
  currency: string;
  edrpou: string;
  mfo: string;
  iban: string;
  bank: string;
  recipient: string;
};

type IbanCardsProps = {
  ibanKeys: IbanCardItem[];
};

const normalizeIban = (iban: string) => iban.replaceAll(/\s+/g, '').trim();

const copyToClipboard = async (value: string) => {
  const text = normalizeIban(value);

  try {
    await navigator.clipboard.writeText(text);

    return;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

export default function IbanCards({ ibanKeys }: IbanCardsProps) {
  const t = useTranslations('paymentspage');

  return (
    <div className="grid grid-cols-1 gap-y-8 gap-x-6 lg:grid-cols-2">
      {ibanKeys.map((key, index) => (
        <div
          key={key.iban}
          className="bg-sky-400/20 rounded-b-xl dark:bg-cyan-500/20 transition-colors"
        >
          <div className="-mt-1 group rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:bg-zinc-600 dark:border-slate-500 dark:hover:border-neutral-400 hover:border-blue-600">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700">
                  {key.currency}
                </span>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-300 transition-colors">
                  {t('financial.iban.edrpou')} {key.edrpou} •{' '}
                  {t('financial.iban.mfo')} {key.mfo}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-sm font-bold tracking-tight">
                  {key.iban}
                </p>

                <button
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-blue-600 dark:hover:bg-slate-300"
                  title={t('financial.iban.copyTitle')}
                  type="button"
                  onClick={() => void copyToClipboard(key.iban)}
                >
                  ⧉
                </button>
              </div>

              <div className="text-[10px] font-medium italic text-slate-500 dark:text-slate-300 transition-colors space-y-1">
                <p>
                  <span className="text-slate-400 dark:text-slate-400 transition-colors">
                    {t('financial.iban.recipient')}:
                  </span>{' '}
                  {key.recipient}
                </p>
                <p>
                  <span className="text-slate-400 dark:text-slate-400 transition-colors">
                    {t('financial.iban.bank')}:
                  </span>{' '}
                  {key.bank}
                </p>
              </div>
              <p className="py-1 text-xs  italic">
                <span className="text-slate-600 dark:text-slate-300 transition-colors">
                  {t('financial.iban.paymentDestination')}:
                </span>{' '}
                <span className="font-medium text-sky-500 dark:text-sky-200 transition-colors">
                  {t('financial.ibanNote')}
                </span>
              </p>
            </div>
          </div>

          <div className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 transition-colors">
            {t(`financial.iban.account${index + 1}.description`)}
          </div>
        </div>
      ))}
    </div>
  );
}
