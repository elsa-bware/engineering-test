export interface Person {
  id: number
  first_name: string
  last_name: string
  photo_url?: string
  roll_state?: string
}

export const PersonHelper = {
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}
