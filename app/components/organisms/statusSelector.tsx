import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from 'app/components/catalyst/dropdown'
import { TRAINING_DAY_STATUS, TRAINING_DAY_STATUStoReadableString } from 'app/types/enums'

export function StatusSelector({ status, updateStatus }: { status: TRAINING_DAY_STATUS | null, updateStatus: (status: TRAINING_DAY_STATUS) => void }) {
  return (
    <Dropdown>
      <DropdownButton
      >{status ? TRAINING_DAY_STATUStoReadableString(status) : 'Select status'}</DropdownButton>
      <DropdownMenu>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.DONE)
          }}

          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.DONE)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.DONE)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.DONE)}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_INJURY)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.SKIPPED_INJURY)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_INJURY)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_INJURY)}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_SORENESS)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.SKIPPED_SORENESS)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_SORENESS)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_SORENESS)}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_PAIN)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.SKIPPED_PAIN)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_PAIN)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_PAIN)}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_WEAK)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.SKIPPED_WEAK)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_WEAK)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_WEAK)}
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_OTHER)
          }}
          onKeyUp={(event) => {
            if (event.key === 'Enter') {
              updateStatus(TRAINING_DAY_STATUS.SKIPPED_OTHER)
            }
          }}
          onTouchEnd={() => {
            updateStatus(TRAINING_DAY_STATUS.SKIPPED_OTHER)
          }}
        >
          {TRAINING_DAY_STATUStoReadableString(TRAINING_DAY_STATUS.SKIPPED_OTHER)}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}