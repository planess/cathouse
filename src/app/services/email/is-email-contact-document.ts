import type {
  EmailAddressReferenceDocument,
  EmailContactDocument,
} from './document-types';

export function isEmailContactDocument(
  reference: EmailAddressReferenceDocument,
): reference is EmailContactDocument {
  return !('createdAt' in reference);
}
