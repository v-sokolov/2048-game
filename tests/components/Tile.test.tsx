import { render } from '@testing-library/react';
import { Tile } from '@/components/Tile/Tile';

describe('Tile', () => {
  it('applies tile--{value} class for a known value', () => {
    const { container } = render(<Tile id="t1" value={512} />);
    expect(container.firstElementChild).toHaveClass('tile--512');
  });

  it('renders the value as text content', () => {
    const { container } = render(<Tile id="t1" value={2048} />);
    expect(container.firstElementChild).toHaveTextContent('2048');
  });

  it('sets data-tile-id attribute equal to id prop', () => {
    const { container } = render(<Tile id="abc-123" value={4} />);
    expect(container.firstElementChild).toHaveAttribute('data-tile-id', 'abc-123');
  });
});
