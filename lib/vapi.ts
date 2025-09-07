import { Vapi } from '@vapi-ai/web';

export class VapiService {
  private vapi: Vapi;

  constructor() {
    this.vapi = new Vapi(process.env.VAPI_API_KEY!);
  }

  async startInterviewCall(phoneNumberId: string): Promise<void> {
    try {
      await this.vapi.start({
        phoneNumberId: phoneNumberId,
        // Add other configuration as needed
      });
    } catch (error) {
      console.error('Error starting Vapi call:', error);
      throw error;
    }
  }

  async endCall(): Promise<void> {
    try {
      await this.vapi.stop();
    } catch (error) {
      console.error('Error ending Vapi call:', error);
      throw error;
    }
  }

  // Add event listeners for call events
  setupEventListeners(onTranscript?: (transcript: string) => void) {
    this.vapi.on('call-start', () => {
      console.log('Call started');
    });

    this.vapi.on('call-end', () => {
      console.log('Call ended');
    });

    this.vapi.on('speech-start', () => {
      console.log('Speech started');
    });

    this.vapi.on('speech-end', () => {
      console.log('Speech ended');
    });

    this.vapi.on('message', (message) => {
      console.log('Message received:', message);
      if (onTranscript && message.type === 'transcript') {
        onTranscript(message.transcript);
      }
    });

    this.vapi.on('error', (error) => {
      console.error('Vapi error:', error);
    });
  }

  // Check if call is active
  isCallActive(): boolean {
    return this.vapi.isActive();
  }
}

export const vapiService = new VapiService();
