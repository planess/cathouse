'use client';

import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

import { toBase64URL } from '@helpers/to-base64-url';

import { IbanCardItem } from './iban-cards';

interface AutoPaymentProps {
  bank: IbanCardItem;
}

const presets = [100, 200, 500, 1000];
const paymentUrl = 'https://bank.gov.ua/qr/';

export function AutoPayment({ bank }: AutoPaymentProps) {
  const t = useTranslations('paymentspage');
  const [amount, setAmount] = useState(200);
  const [customAmount, setCustomAmount] = useState('');
  const [path, setPath] = useState('');

  const pd = t('financial.ibanNote');

  const currencySymbol = bank.currency.toUpperCase().includes('UAH')
    ? '₴'
    : bank.currency;

  const handlePresetClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleAmountChange = (value: string) => {
    if (value.trim() === '') {
      setCustomAmount('');
      return;
    }

    const parsed = Number(value);

    setCustomAmount(value);

    if (!Number.isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  useEffect(() => {
    const iban = bank.iban.replaceAll(/\s+/g, '').trim();
    const amount2 = amount.toFixed(2);
    const data = [
      'BCD',
      '002',
      '1',
      'UCT',
      '',
      bank.recipient,
      iban,
      `UAH${amount2}`,
      bank.edrpou,
      '',
      '',
      pd,
      '',
      '',
    ].join('\n');

    // encode to base64 (UTF-8 safe) and then URI encode
    setPath(toBase64URL(data));
  }, [amount, bank.iban, bank.recipient, bank.edrpou, pd]);

  return (
    <div className="mt-6 flex flex-col gap-6 rounded-xl border border-slate-200 bg-slate-50 p-6 relative overflow-hidden dark:border-slate-700 dark:bg-slate-900/40">
      <div className="absolute -top-16 -right-16 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl pointer-events-none dark:bg-blue-400/10" />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-4 relative z-10">
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              {t('financial.quickDonate.title')}
            </h4>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
              {t('financial.quickDonate.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((value) => {
              const isActive = amount === value;

              return (
                <button
                  key={value}
                  className={`rounded-lg border px-2 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-100 dark:ring-blue-400/30'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300'
                  }`}
                  type="button"
                  onClick={() => handlePresetClick(value)}
                >
                  {value} {currencySymbol}
                </button>
              );
            })}
          </div>

          <div className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
              {currencySymbol}
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm font-bold text-slate-900 shadow-sm transition-all placeholder:font-medium placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder={t('financial.quickDonate.inputPlaceholder')}
              type="number"
              inputMode="numeric"
              value={customAmount}
              onChange={(event) => handleAmountChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row items-center gap-5 md:pl-6 md:border-l border-slate-200 pt-4 md:pt-0 border-t md:border-t-0 relative z-10 dark:border-slate-700">
          <div className="shrink-0 rounded-xl border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-white dark:bg-slate-100">
              <QRCodeSVG
                value={paymentUrl + path}
                bgColor="#ffffff"
                fgColor="#0f172a"
                marginSize={2}
                size={140}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t('financial.quickDonate.qrTitle')}
              </p>
              <p className="text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                {t('financial.quickDonate.qrDescription')}
              </p>
            </div>

            <a
              className="md:hidden flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 dark:shadow-blue-900/40"
              target="_blank"
              href={paymentUrl + path}
            >
              <span>{t('financial.quickDonate.button')}</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
