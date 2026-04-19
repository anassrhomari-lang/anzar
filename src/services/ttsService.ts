import { GoogleGenAI, Modality } from "@google/genai";

export class GeminiTTSService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  private addWavHeader(pcmData: ArrayBuffer, sampleRate: number) {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF identifier
    view.setUint32(0, 0x52494646, false); // "RIFF"
    // file length
    view.setUint32(4, 36 + pcmData.byteLength, true);
    // RIFF type
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // format chunk identifier
    view.setUint32(12, 0x666d7420, false); // "fmt "
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (raw)
    view.setUint16(20, 1, true); // PCM
    // channel count
    view.setUint16(22, 1, true); // Mono
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    view.setUint32(36, 0x64617461, false); // "data"
    // data chunk length
    view.setUint32(40, pcmData.byteLength, true);

    return new Uint8Array(header);
  }

  async generateAudioChunk(text: string, voice: string = 'Charon', retries = 3, delay = 2000): Promise<ArrayBuffer> {
    try {
      console.log(`[TTS] Requesting audio for ${text.length} characters...`);
      
      const prompt = `You are a professional medical narrator. Your task is to read the following text VERBATIM, word-for-word, without skipping anything and without adding any commentary. 
      
      TEXT TO NARRATE:
      ${text}`;

      const response = await this.ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice as any },
            },
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('AI failed to respond.');
      }

      const base64Audio = response.candidates[0].content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error('No audio data received from Gemini.');
      }

      console.log(`[TTS] Received audio data: ${Math.round(base64Audio.length / 1024)} KB`);

      const binaryString = window.atob(base64Audio);
      if (binaryString.length < 100) {
        throw new Error('Audio data too short, likely a generation failure.');
      }

      const pcmBytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) {
        pcmBytes[j] = binaryString.charCodeAt(j);
      }

      const wavHeader = this.addWavHeader(pcmBytes.buffer, 24000);
      const fullWav = new Uint8Array(wavHeader.length + pcmBytes.length);
      fullWav.set(wavHeader);
      fullWav.set(pcmBytes, wavHeader.length);

      return fullWav.buffer;
    } catch (error: any) {
      console.error('[TTS Chunk Error]', error);
      
      const isRetryable = error.status === 500 || error.status === 429 || error.message?.includes('500') || error.message?.includes('429');
      
      if (retries > 0 && isRetryable) {
        console.warn(`TTS Error hit. Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.generateAudioChunk(text, voice, retries - 1, delay * 2);
      }
      
      throw error;
    }
  }

  async generatePodcast(text: string, options: { voice?: string; speed?: number } = {}) {
    const { voice = 'Charon' } = options;
    
    // For backward compatibility, but we'll prefer part-by-part in UI
    const CHUNK_SIZE = 2000;
    const chunk = text.substring(0, CHUNK_SIZE);
    return this.generateAudioChunk(chunk, voice);
  }

  get voices() {
    return {
      professional_male: 'Charon',
      professional_female: 'Kore',
      narrator: 'Puck',
      calm: 'Zephyr'
    };
  }
}

export const ttsService = new GeminiTTSService();
