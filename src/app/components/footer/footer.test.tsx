import { render, screen } from '@testing-library/react';

import Footer from './footer';

test('renders current year', () => {
  const year = new Date().getFullYear().toString();
  render(<Footer />);
  expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
});
