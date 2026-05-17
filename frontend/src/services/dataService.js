import { api } from './api';

export async function getLecturers() { return (await api.get('/lecturers')).data; }
export async function getDashboard(lecturerId) { return (await api.get(`/lecturers/${lecturerId}/dashboard`)).data; }
export async function synchronizeLecturer(lecturerId, source) { return (await api.post(`/lecturers/${lecturerId}/sync/${source}`)).data; }
export async function getUsers() { return (await api.get('/data/users')).data; }
export async function createUser(payload) { return (await api.post('/data/users', payload)).data; }
export async function updateUser(id, payload) { return (await api.put(`/data/users/${id}`, payload)).data; }
export async function getResearches(lecturerId) { return (await api.get('/data/researches', { params: { lecturerId } })).data; }
export async function getServices(lecturerId) { return (await api.get('/data/services', { params: { lecturerId } })).data; }
export async function getGrants() { return (await api.get('/data/grants')).data; }
export async function createGrant(payload) { return (await api.post('/data/grants', payload)).data; }
export async function updateGrant(id, payload) { return (await api.put(`/data/grants/${id}`, payload)).data; }
export async function deleteGrant(id) { return api.delete(`/data/grants/${id}`); }
export async function getArticleDocument(articleId) { return (await api.get(`/data/articles/${articleId}/document`)).data; }
export async function downloadArticleDocumentFile(articleId) {
  return (await api.get(`/data/articles/${articleId}/document/file`, { responseType: 'blob' })).data;
}
export async function saveArticleDocument(articleId, payload) { return (await api.put(`/data/articles/${articleId}/document`, payload)).data; }
export async function uploadArticleDocumentFile(articleId, file) {
  const payload = new FormData();
  payload.append('file', file);
  return (await api.post(`/data/articles/${articleId}/document/file`, payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })).data;
}
