import { mockSintaProfile, mockPddiktiProfile } from '../data/mock';

export async function getProfile() {
  return { sinta: mockSintaProfile, pddikti: mockPddiktiProfile };
}
