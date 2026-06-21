import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the game heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /2048 game/i })).toBeInTheDocument();
});
