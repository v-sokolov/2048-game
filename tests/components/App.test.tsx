import { render, screen } from '@testing-library/react';
import { App } from '@/components/App/App';

it('renders without crashing', () => {
  render(<App />);
  expect(screen.getByText('2048')).toBeInTheDocument();
});
