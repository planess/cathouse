import clsx from 'clsx';

import { AlertCircleIcon } from '@app/components/icons/alert-circle-icon';
import { CheckIcon } from '@app/components/icons/check-icon';
import { InfoCircleIcon } from '@app/components/icons/info-circle-icon';

import type { AuthAlertProps } from '../../models/auth-alert-props';
import type { AuthAlertTone } from '../../models/auth-alert-tone';

const TONE_CLASS_NAMES: Record<AuthAlertTone, string> = {
  error: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  success:
    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300',
  info: 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200',
};

const TONE_ICONS: Record<AuthAlertTone, typeof AlertCircleIcon> = {
  error: AlertCircleIcon,
  success: CheckIcon,
  info: InfoCircleIcon,
};

/**
 * Inline message shown inside a guest (auth) form card.
 *
 * @param props - Alert props.
 * @param props.tone - Visual tone; errors are announced with `role="alert"`.
 * @param props.children - Alert content.
 */
export default function AuthAlert({ tone, children }: AuthAlertProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-2.5 rounded-lg p-3 text-sm',
        TONE_CLASS_NAMES[tone],
      )}
    >
      <Icon width={20} height={20} className="shrink-0" />
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}
