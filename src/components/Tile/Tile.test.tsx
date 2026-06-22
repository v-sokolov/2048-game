import { render } from '@testing-library/react';
import { Tile } from './Tile';

describe('Tile', () => {
  it('applies tile--{value} class for a known value', () => {
    const { container } = render(<Tile id="t1" value={512} />);
    expect(container.firstElementChild).toHaveClass('tile--512');
  });

  it('treats 2048 as a defined variant, not the empty fallback', () => {
    const { container } = render(<Tile id="t1" value={2048} />);
    expect(container.firstElementChild).toHaveClass('tile--2048');
    expect(container.firstElementChild).not.toHaveClass('tile--empty');
  });

  it('falls back to tile--empty for an out-of-set value', () => {
    const { container } = render(<Tile id="t1" value={2049} />);
    expect(container.firstElementChild).toHaveClass('tile--empty');
  });

  it('renders tile--empty but still exposes its data-tile-id when no value is provided', () => {
    const { container } = render(<Tile id="empty-1" />);
    expect(container.firstElementChild).toHaveClass('tile--empty');
    expect(container.firstElementChild).toHaveAttribute('data-tile-id', 'empty-1');
  });

  it('sets data-tile-id attribute equal to id prop', () => {
    const { container } = render(<Tile id="abc-123" value={4} />);
    expect(container.firstElementChild).toHaveAttribute('data-tile-id', 'abc-123');
  });
});
