import { api } from './client';

export const Auth = {
  sendOtp: (phone: string) => api.post('/auth/otp/send', { phone }).then(r => r.data),
  verifyOtp: (phone: string, code: string) => api.post('/auth/otp/verify', { phone, code }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }).then(r => r.data),
};

export const Pets = {
  mine: () => api.get('/pets').then(r => r.data),
  create: (data: any) => api.post('/pets', data).then(r => r.data),
  update: (id: string, data: any) => api.patch(`/pets/${id}`, data).then(r => r.data),
  remove: (id: string) => api.delete(`/pets/${id}`).then(r => r.data),
  aiBio: (id: string) => api.post(`/pets/${id}/ai-bio`).then(r => r.data),
  nearby: (lat: number, lng: number, radiusKm = 25, mode?: string) =>
    api.get('/pets/nearby', { params: { lat, lng, radiusKm, mode } }).then(r => r.data),
};

export const Matches = {
  list: () => api.get('/matches').then(r => r.data),
  stack: (petId: string, mode = 'FRIENDS') => api.get('/matches/stack', { params: { petId, mode } }).then(r => r.data),
  unmatch: (id: string) => api.delete(`/matches/${id}`).then(r => r.data),
};

export const Swipes = {
  swipe: (data: { swiperPetId: string; targetPetId: string; action: 'SNIFF'|'SUPER_SNIFF'|'PASS'; mode: string }) =>
    api.post('/swipes', data).then(r => r.data),
};

export const Chats = {
  list: () => api.get('/chats').then(r => r.data),
  messages: (id: string, cursor?: string) => api.get(`/chats/${id}/messages`, { params: { cursor } }).then(r => r.data),
  send: (id: string, data: any) => api.post(`/chats/${id}/messages`, data).then(r => r.data),
};

export const Posts = {
  feedTails: (cursor?: string) => api.get('/feed/tails', { params: { cursor } }).then(r => r.data),
  feedDiscover: (cursor?: string) => api.get('/feed/discover', { params: { cursor } }).then(r => r.data),
  like: (id: string) => api.post(`/posts/${id}/like`).then(r => r.data),
  unlike: (id: string) => api.delete(`/posts/${id}/like`).then(r => r.data),
  create: (data: any) => api.post('/posts', data).then(r => r.data),
};

export const Uploads = {
  sign: (filename: string, contentType: string) =>
    api.post('/uploads/sign', { filename, contentType }).then(r => r.data),
};
