export type NoticeCreateVoteDraft = {
  allowMultiple: boolean
  endDate: Date | null
  endTime: string
  isAnonymous: boolean
  options: string[]
  startDate: Date | null
  startTime: string
  title: string
}

export const NOTICE_CREATE_VOTE_OPTION_MIN = 2
export const NOTICE_CREATE_VOTE_OPTION_MAX = 5

export function createInitialNoticeCreateVoteDraft(): NoticeCreateVoteDraft {
  return {
    allowMultiple: false,
    endDate: null,
    endTime: "",
    isAnonymous: false,
    options: ["", ""],
    startDate: null,
    startTime: "",
    title: "",
  }
}
