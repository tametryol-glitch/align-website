import { createClient } from '@/lib/supabase';

const PHASE_0_ALLOWLIST = new Set<string>([
  'tametryol@gmail.com',
]);

export interface CaptureSampleInput {
  userPrompt: string;
  rawText: string;
  cleanedText: string;
  finalText: string;
  pipelineVersion?: 'v1' | 'v2';
}

function hasDoubledWord(s: string): boolean {
  return /\b(\w{2,})\s+\1\b/i.test(s);
}

function endsMidSentence(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed) return false;
  const last = trimmed[trimmed.length - 1];
  return !'.!?)"'.includes(last);
}

export function captureAiSample(input: CaptureSampleInput, userId?: string, email?: string): void {
  try {
    if (!email || !userId) return;
    if (!PHASE_0_ALLOWLIST.has(email)) return;

    const row = {
      user_id: userId,
      pipeline_version: input.pipelineVersion ?? 'v1',
      user_prompt: input.userPrompt.slice(0, 2000),
      raw_text: input.rawText,
      cleaned_text: input.cleanedText,
      final_text: input.finalText,
      raw_len: input.rawText.length,
      cleaned_len: input.cleanedText.length,
      final_len: input.finalText.length,
      clean_delta: input.rawText.length - input.cleanedText.length,
      gate_delta: input.cleanedText.length - input.finalText.length,
      had_doubled_word: hasDoubledWord(input.finalText),
      had_trailing_ellipsis: /\.{3,}\s*$/.test(input.finalText.trim()),
      ended_midsentence: endsMidSentence(input.finalText),
      app_version: null,
      platform: 'web',
      extra: null as any,
    };

    void createClient()
      .from('ai_quality_samples')
      .insert(row)
      .then(() => {}, () => {});
  } catch {
    // Silent failure
  }
}
