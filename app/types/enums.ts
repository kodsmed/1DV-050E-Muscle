export enum TimeFrame {
  'allTime' = 'all time',
  'lastWeek' = 'last week',
  'lastMonth' = 'last month',
  'lastYear' = 'last year',
}
export enum TRAINING_DAY_STATUS {
  PENDING = 'PENDING',
  DONE = 'DONE',
  SKIPPED_INJURY = 'SKIPPED_INJURY',
  SKIPPED_SORENESS = 'SKIPPED_SORENESS',
  SKIPPED_PAIN = 'SKIPPED_PAIN',
  SKIPPED_WEAK = 'SKIPPED_WEAK',
  SKIPPED_OTHER = 'SKIPPED_OTHER',
}

export function TRAINING_DAY_STATUStoReadableString(status: TRAINING_DAY_STATUS): string {
  switch (status) {
    case TRAINING_DAY_STATUS.PENDING:
      return 'Pending';
    case TRAINING_DAY_STATUS.DONE:
      return 'Done';
    case TRAINING_DAY_STATUS.SKIPPED_INJURY:
      return 'Skipped due to injury';
    case TRAINING_DAY_STATUS.SKIPPED_SORENESS:
      return 'Skipped due to soreness';
    case TRAINING_DAY_STATUS.SKIPPED_PAIN:
      return 'Skipped due to pain';
    case TRAINING_DAY_STATUS.SKIPPED_WEAK:
      return 'Skipped due to fatigue';
    case TRAINING_DAY_STATUS.SKIPPED_OTHER:
      return 'Skipped for other reasons';
    default:
      return 'Unknown status';
  }
}