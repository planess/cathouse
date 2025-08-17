'use client';

import { useCryptoKeys } from './use-crypto-keys';

export default function CryptoKeysExample() {
  const { publicKey, cryptoKey, isLoading, error } = useCryptoKeys();

  // Or use the convenience hooks:
  // const publicKey = usePublicKey();
  // const cryptoKey = useCryptoKey();
  // const isLoading = useCryptoKeysLoading();
  // const error = useCryptoKeysError();

  if (isLoading) {
    return <div>Loading crypto keys...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h3>Crypto Keys Example</h3>
      <p>
        <strong>Public Key:</strong>
      </p>
      <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
        {publicKey}
      </pre>
      <p className="text-sm text-gray-600 mt-2">
        This public key was either loaded from the database or newly generated
        on the server if none existed. The CryptoKey object is ready for encryption.
      </p>
      {cryptoKey && (
        <p className="text-sm text-green-600 mt-2">
          ✅ CryptoKey object is available for encryption operations
        </p>
      )}
    </div>
  );
}
