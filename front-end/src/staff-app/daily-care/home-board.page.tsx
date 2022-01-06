import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { ListItem } from "@material-ui/core"
import { RolllStateType } from "shared/models/roll"
import { ItemType } from "staff-app/components/roll-state/roll-state-list.component"
import { rollInitialType } from "shared/helpers/data-generation"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [isAscending, setIsAscending] = useState(true)
  const [selectedNameSortOption, setSelectedNameSortOption] = useState("First Name")
  const [searchTerm, setSearchTerm] = useState("")
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [studentsArrayInState, setStudentsArrayInState] = useState(data?.students.slice())

  const typeAll: ItemType = "all"
  const typePresent: ItemType = "present"
  const typeLate: ItemType = "late"
  const typeAbsent: ItemType = "absent"
  const [stateList, setStateList] = useState([
    { type: typeAll, count: 0 },
    { type: typePresent, count: 0 },
    { type: typeLate, count: 0 },
    { type: typeAbsent, count: 0 },
  ])

  const [filterRollState, setFilterRollState] = useState("")

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    setStudentsArrayInState(
      data?.students.map((s) => {
        let a = s
        a.roll_state = rollInitialType
        return a
      })
    )
    setStateList([{ type: typeAll, count: data?.students.length ? data?.students.length : 0 }, stateList[1], stateList[2], stateList[3]])
  }, [data])

  const onStateChangeRollType = (nextType: RolllStateType, currentType: RolllStateType) => {
    if (currentType === "unmark") {
      setStateList([stateList[0], { type: typePresent, count: stateList[1].count + 1 }, stateList[2], stateList[3]])
    }
    if (currentType === "present") {
      setStateList([stateList[0], { type: typePresent, count: stateList[1].count - 1 }, { type: typeLate, count: stateList[2].count + 1 }, stateList[3]])
    }
    if (currentType === "late") {
      setStateList([stateList[0], stateList[1], { type: typeLate, count: stateList[2].count - 1 }, { type: typeAbsent, count: stateList[3].count + 1 }])
    }
    if (currentType === "absent") {
      setStateList([stateList[0], { type: typePresent, count: stateList[1].count + 1 }, stateList[2], { type: typeAbsent, count: stateList[3].count - 1 }])
    }
  }

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    } else if (action === "sortByAscDes") {
      setIsAscending(!isAscending)
    } else if (action === "sortByFName") {
      setSelectedNameSortOption("First Name")
    } else if (action === "sortByLName") {
      setSelectedNameSortOption("Last Name")
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const handleFilterRollState = (rollType: ItemType) => {
    setFilterRollState(rollType)
  }

  const setStudentRollState = (id: number, newState: RolllStateType) => {
    let index = studentsArrayInState?.findIndex((s) => s.id === id)
    if (index !== undefined) {
      let newStudents = studentsArrayInState?.slice()
      if (newStudents) {
        newStudents[index].roll_state = newState
        setStudentsArrayInState(newStudents)
      }
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar
          onItemClick={onToolbarAction}
          selectedNameSortOption={selectedNameSortOption}
          setSelectedNameSortOption={setSelectedNameSortOption}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && studentsArrayInState && (
          <>
            {studentsArrayInState
              .sort((a, b) => {
                console.log("sorting")
                let sortTargetA = a.first_name
                let sortTargetB = b.first_name
                if (selectedNameSortOption === "Last Name") {
                  sortTargetA = a.last_name
                  sortTargetB = b.last_name
                }

                if (isAscending && sortTargetA < sortTargetB) {
                  return -1
                } else if (isAscending && sortTargetA > sortTargetB) {
                  return 1
                } else if (!isAscending && sortTargetA < sortTargetB) {
                  return 1
                } else if (!isAscending && sortTargetA > sortTargetB) {
                  return -1
                } else {
                  return 0
                }
              })
              .filter((person) => {
                return searchTerm === "" || person.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || person.last_name.toLowerCase().includes(searchTerm.toLowerCase())
              })
              .filter((person) => {
                console.log("person state: " + person.roll_state + ", filter state: " + filterRollState)
                return filterRollState === "" || filterRollState === "all" || person.roll_state === filterRollState
              })
              .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onStateChange={onStateChangeRollType} changeStudentRollState={setStudentRollState} />
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} stateList={stateList} onFilterClick={handleFilterRollState} />
    </>
  )
}

type ToolbarAction = "roll" | "sortByFName" | "sortByLName" | "sortByAscDes"

interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  selectedNameSortOption: string
  setSelectedNameSortOption: React.Dispatch<React.SetStateAction<string>>
  searchTerm?: string
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, selectedNameSortOption: selectedOption, setSelectedNameSortOption: setSelectedOption, searchTerm, setSearchTerm } = props
  const [isAscending, setIsAscending] = useState(true)

  const handleChange = (event: { target: { value: any } }) => {
    if (setSearchTerm !== undefined) setSearchTerm(event.target.value)
  }

  return (
    <S.ToolbarContainer>
      <S.SortContainer>
        <DropDownContent onItemClick={onItemClick} selectedNameSortOption={selectedOption} setSelectedNameSortOption={setSelectedOption}></DropDownContent>
        <S.Button
          onClick={() => {
            onItemClick("sortByAscDes")
            setIsAscending(!isAscending)
          }}
        >
          {isAscending ? "A" : "D"}
        </S.Button>
      </S.SortContainer>

      <div>
        <input type="text" placeholder="Search" value={searchTerm} onChange={handleChange}></input>
      </div>

      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const DropDownContent: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, selectedNameSortOption: selectedNameSortOption, setSelectedNameSortOption: setSelectedNameSortOption } = props
  const [isDisplayed, setIsDisplayed] = useState(false)

  const toggleDisplay = () => {
    setIsDisplayed(!isDisplayed)
  }

  const onOptionClicked = (value: string) => {
    setSelectedNameSortOption(value)
    setIsDisplayed(false)
    let action: ToolbarAction
    if (value === "First Name") {
      action = "sortByFName"
    } else {
      action = "sortByLName"
    }
    onItemClick(action)
  }

  const options = ["First Name", "Last Name"]

  return (
    <div>
      <S.Button onClick={() => toggleDisplay()}>{selectedNameSortOption}</S.Button>
      {isDisplayed && (
        <S.DropDownListContainer>
          <S.DropdownList
            onBlur={() => {
              alert("haha")
              setIsDisplayed(false)
            }}
            tabIndex={0}
          >
            {options.map((option) => (
              <ListItem
                onClick={() => {
                  onOptionClicked(option)
                }}
                key={Math.random()}
              >
                {option}
              </ListItem>
            ))}
          </S.DropdownList>
        </S.DropDownListContainer>
      )}
    </div>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
    overflow: visible !important;
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SortContainer: styled.div`
    display: flex;
    flex-direction: row;
  `,
  DropDownListContainer: styled.div`
    position: relative;
  `,
  DropdownList: styled.ul`
    margin: 0;
    padding: 12px;
    padding-left: 0px;
    background: #ffffff;
    border-radius: 6px;
    box-sizing: border-box;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    color: #002744;
    font-weight: 500;
    position: absolute;
    z-index: 1;
    min-width: 160px;
    cursor: pointer;
  `,
  ListItem: styled.li`
    list-style: none;
    margin-bottom: 0.8em;
    &:hover,
    &:focus {
      background: palevioletred;
    }
    &:active {
      background: red;
    }
  `,
}
