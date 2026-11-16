import { EmailContactsHeader } from './components/email-contacts-header';
import { EmailContactsLoading } from './components/email-contacts-loading';

/** Instant loading state for the contacts route, shown while the page renders on the server. */
export default function EmailContactsPageLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <EmailContactsHeader />
      <EmailContactsLoading />
    </div>
  );
}
