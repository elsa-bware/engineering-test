import { getRandomInt, generateRange } from "shared/helpers/math-utils"
import { RolllStateType } from "shared/models/roll"

const nameTokens = ["Alan", "John", "Brandon", "Key", "Branda", "Morris", "Carlos", "Lee"]
const rollInitialType: RolllStateType = "unmark"

export function generateStudent(id: number) {
  return {
    id,
    first_name: nameTokens[getRandomInt(0, nameTokens.length - 1)],
    last_name: nameTokens[getRandomInt(0, nameTokens.length - 1)],
    roll_state: rollInitialType,
  }
}

export function generateStudents(number: number) {
  return generateRange(number).map((_, id) => generateStudent(id + 1))
}
