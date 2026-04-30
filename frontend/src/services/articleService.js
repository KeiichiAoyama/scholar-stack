import { mockArticles } from '../data/mock';

export async function getArticles(source) {
  return mockArticles.filter((a) => a.source === source);
}
