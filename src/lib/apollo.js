// src/lib/apollo.js
import { NhostApolloProvider } from '@nhost/react-apollo';
import { nhost } from './nhost';

export function ApolloWrapper({ children }) {
  return (
    <NhostApolloProvider nhost={nhost}>
      {children}
    </NhostApolloProvider>
  );
}
