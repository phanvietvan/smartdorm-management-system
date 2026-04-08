import { api } from './client';

export const aiApi = {
  chat: (message: string, history: any[]) => 
    api.post('/ai/chat', { message, history }),
};
