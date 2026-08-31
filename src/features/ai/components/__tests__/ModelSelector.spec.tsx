import { render, screen, fireEvent } from '@testing-library/react';
import { ModelSelector } from '../ModelSelector';
import { DiscoveredModelItem } from '../../api/aiApi';
import { describe, it, expect, vi } from 'vitest';

describe('ModelSelector (Live Discovery and Model Management V3)', () => {
  const mockDiscoveredModels: DiscoveredModelItem[] = [
    {
      id: 'gemini-2.5-flash',
      displayName: 'Gemini 2.5 Flash',
      provider: 'google',
      supportsChat: true,
      supportsStreaming: true,
      supportsTools: true,
      supportsStructuredOutput: true,
      contextWindow: 1048576,
      inputPricePer1M: 0.10,
      outputPricePer1M: 0.40,
      status: 'AVAILABLE',
      source: 'LIVE_PROVIDER',
    },
    {
      id: 'gemini-2.0-flash',
      displayName: 'Gemini 2.0 Flash',
      provider: 'google',
      supportsChat: true,
      supportsStreaming: true,
      supportsTools: true,
      supportsStructuredOutput: true,
      contextWindow: 1048576,
      inputPricePer1M: 0.10,
      outputPricePer1M: 0.40,
      status: 'AVAILABLE',
      source: 'LIVE_PROVIDER',
    },
  ];

  it('renders live discovered models and capability badges when provided', () => {
    const handleChange = vi.fn();
    render(
      <ModelSelector
        provider="google"
        value="gemini-2.5-flash"
        onChange={handleChange}
        discoveredModels={mockDiscoveredModels}
      />
    );

    expect(screen.getByText(/Live Provider/i)).toBeDefined();
    expect(screen.getByText(/Streaming/i)).toBeDefined();
    expect(screen.getByText(/Tools/i)).toBeDefined();
  });

  it('shows a warning alert when current model is deprecated (gemini-2.0-flash-lite)', () => {
    render(
      <ModelSelector
        provider="google"
        value="gemini-2.0-flash-lite"
        onChange={vi.fn()}
        discoveredModels={mockDiscoveredModels}
      />
    );

    expect(screen.getByText(/gemini-2.0-flash-lite.*shut down/i)).toBeDefined();
  });

  it('triggers onRefreshModels callback when Refresh button is clicked', () => {
    const handleRefresh = vi.fn();
    render(
      <ModelSelector
        provider="google"
        value="gemini-2.5-flash"
        onChange={vi.fn()}
        onRefreshModels={handleRefresh}
      />
    );

    const refreshBtn = screen.getByText(/Refresh Live/i);
    fireEvent.click(refreshBtn);
    expect(handleRefresh).toHaveBeenCalledTimes(1);
  });
});
