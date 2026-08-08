import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getVoiceService } from '../voiceService';
import { localVoiceService } from '../adapters/localVoiceAdapter';
import { coreVoiceService } from '../adapters/coreVoiceAdapter';

describe('voice service seam', () => {
  it('defaults to the local (Web Speech) adapter', () => {
    expect(getVoiceService()).toBe(localVoiceService);
    expect(localVoiceService.id).toBe('local');
    expect(localVoiceService.ready).toBe(true);
    expect(localVoiceService.capabilities).toEqual({ stt: true, tts: false });
  });

  it('the core adapter is present but not ready (no invented contract)', () => {
    expect(coreVoiceService.id).toBe('core');
    expect(coreVoiceService.ready).toBe(false);
    expect(coreVoiceService.capabilities).toEqual({ stt: false, tts: false });
  });

  it('local session reports unavailable when Web Speech is absent (jsdom)', () => {
    const { result } = renderHook(() => localVoiceService.useSession());
    expect(result.current.supported).toBe(false);
    expect(result.current.status).toBe('unavailable');
    expect(typeof result.current.start).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
  });

  it('core session is always unavailable', () => {
    const { result } = renderHook(() => coreVoiceService.useSession());
    expect(result.current.status).toBe('unavailable');
    expect(result.current.supported).toBe(false);
  });
});
