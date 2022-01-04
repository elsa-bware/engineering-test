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

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [isAscending, setIsAscending] = useState(true)
  const [selectedOption, setSelectedOption] = useState("First Name")
  const [searchTerm, setSearchTerm] = useState("")
  const [getStudents, data, loadState, error] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    } else if (action === "sortByAscDes") {
      setIsAscending(!isAscending)
    } else if (action === "sortByFName") {
      setSelectedOption("First Name")
    } else if (action === "sortByLName") {
      setSelectedOption("Last Name")
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} selectedOption={selectedOption} setSelectedOption={setSelectedOption} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {data.students
              .sort((a, b) => {
                let sortTargetA = a.first_name
                let sortTargetB = b.first_name
                if (selectedOption === "Last Name") {
                  sortTargetA = a.last_name
                  sortTargetB = b.last_name
                }

                if (isAscending && sortTargetA.charAt(0) < sortTargetB.charAt(0)) {
                  return -1
                } else if (isAscending && sortTargetA.charAt(0) > sortTargetB.charAt(0)) {
                  return 1
                } else if (!isAscending && sortTargetA.charAt(0) < sortTargetB.charAt(0)) {
                  return 1
                } else if (!isAscending && sortTargetA.charAt(0) > sortTargetB.charAt(0)) {
                  return -1
                } else {
                  return 0
                }
              })
              .filter((person) => {
                return searchTerm === "" || person.first_name.toLowerCase().includes(searchTerm) || person.last_name.toLowerCase().includes(searchTerm)
              })
              .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sortByFName" | "sortByLName" | "sortByAscDes"

interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  selectedOption: string
  setSelectedOption: React.Dispatch<React.SetStateAction<string>>
  searchTerm?: string
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>
}

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick, selectedOption, setSelectedOption, searchTerm, setSearchTerm } = props
  const [isAscending, setIsAscending] = useState(true)

  const handleChange = (event: { target: { value: any } }) => {
    if (setSearchTerm !== undefined) setSearchTerm(event.target.value)
  }

  return (
    <S.ToolbarContainer>
      <S.SortContainer>
        <DropDownContent onItemClick={onItemClick} selectedOption={selectedOption} setSelectedOption={setSelectedOption}></DropDownContent>
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
  const { onItemClick, selectedOption, setSelectedOption } = props
  const [isDisplayed, setIsDisplayed] = useState(false)

  const toggleDisplay = () => {
    setIsDisplayed(!isDisplayed)
  }

  const onOptionClicked = (value: string) => {
    setSelectedOption(value)
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
      <S.Button onClick={() => toggleDisplay()}>{selectedOption}</S.Button>
      {isDisplayed && (
        <S.DropDownListContainer>
          <S.DropdownList
            onBlur={() => {
              alert("hshs")
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
