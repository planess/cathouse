import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Footer from './footer';

test('renders footer content', () => {
  render(<Footer />);
  expect(screen.getByText('Since 2021 with care for our little friends')).toBeInTheDocument();
  expect(screen.getByText('by Planess Group')).toBeInTheDocument();
  expect(screen.getByText('Location')).toBeInTheDocument();
});
