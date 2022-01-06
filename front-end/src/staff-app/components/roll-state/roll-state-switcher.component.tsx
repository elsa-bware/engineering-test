import React, { useState, useEffect } from "react"
import { Person } from "shared/models/person"
import { Roll, RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange: (newState: RolllStateType, currentState: RolllStateType) => void
  changeStudentRollState: (id: number, newState: RolllStateType) => void
  student: Person
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, changeStudentRollState, student }) => {
  const [rollState, setRollState] = useState(initialState)

  useEffect(() => {
    setRollState(student.roll_state)
  }, [student])

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    const next = nextState()
    const currentRS = rollState
    setRollState(next)
    onStateChange(next, currentRS)
    changeStudentRollState(student.id, next)
  }

  return <RollStateIcon type={rollState} size={size} onClick={onClick} />
}
