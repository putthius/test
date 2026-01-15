export type competition = "ICYS" | "KVIS-ISF" | "";
export type participant = {
  name:string,
  role: string;
  familyName: string;
  checkedIn: boolean;
  projectTitle?: string;
  projectCategory?: string;
};
export type icys = {
  "Country":string,
  "Participation Type":string,
  "Title":string,
  "Given name":string,
  "Family name":string
}
export type isf = {
  "School":string,
  "Participation Type":string,
  "Title":string,
  "Given name":string,
  "Family name":string,
}
export type SelectParticipant = {
  name:string,
  role: string;
  familyName: string;
}

export const categories = [
  "None",
  "Physics",
  "Environmental Science",
  "Mathematics",
  "Engineering",
  "Computer Science",
  "Life Science"
]