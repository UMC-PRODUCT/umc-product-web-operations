import { useState } from "react"

import type { NoticeCreateVoteDraft } from "../model/notice-create-vote-draft"

type UseNoticeVoteDraftOptions = {
  /** 투표 초안이 저장·삭제될 때 호출 (이전 제출 진행 상황 초기화 등) */
  onDraftChange?: () => void
}

/** 공지 작성·수정 공통: 투표 초안과 투표 패널·삭제 Dialog 열림 상태 */
export function useNoticeVoteDraft({
  onDraftChange,
}: UseNoticeVoteDraftOptions = {}) {
  const [voteDraft, setVoteDraft] = useState<NoticeCreateVoteDraft | null>(null)
  const [votePanelOpen, setVotePanelOpen] = useState(false)
  const [voteDeleteDialogOpen, setVoteDeleteDialogOpen] = useState(false)

  const openVotePanel = () => {
    setVotePanelOpen(true)
  }

  const closeVotePanel = () => {
    setVotePanelOpen(false)
  }

  const openVoteDeleteDialog = () => {
    setVoteDeleteDialogOpen(true)
  }

  const saveVoteDraft = (draft: NoticeCreateVoteDraft) => {
    onDraftChange?.()
    setVoteDraft(draft)
    setVotePanelOpen(false)
  }

  const clearVoteDraft = () => {
    onDraftChange?.()
    setVoteDraft(null)
    setVoteDeleteDialogOpen(false)
  }

  return {
    clearVoteDraft,
    closeVotePanel,
    openVoteDeleteDialog,
    openVotePanel,
    saveVoteDraft,
    setVoteDeleteDialogOpen,
    voteDeleteDialogOpen,
    voteDraft,
    votePanelOpen,
  }
}
