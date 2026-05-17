import { api } from './api';

export async function getArticles(lecturerId, source) {
  const response = await api.get('/data/articles', { params: { lecturerId, source } });
  return response.data;
}
