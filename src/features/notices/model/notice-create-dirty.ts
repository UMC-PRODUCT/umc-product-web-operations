import {
  INITIAL_NOTICE_CREATE_FORM,
  type NoticeCreateFormState,
} from "./notice-create-form"

/** 세션 기수 자동 설정만으로는 “작성 중”으로 보지 않습니다. */
export function isNoticeCreateFormDirty(form: NoticeCreateFormState): boolean {
  if (form.title.trim() || form.content.trim()) {
    return true
  }
  if (form.linkDraft.trim() || form.links.length > 0) {
    return true
  }
  if (form.imageFiles.length > 0) {
    return true
  }
  if (form.challengerEnabled !== INITIAL_NOTICE_CREATE_FORM.challengerEnabled) {
    return true
  }
  if (form.staffEnabled !== INITIAL_NOTICE_CREATE_FORM.staffEnabled) {
    return true
  }
  if (form.staffScope !== INITIAL_NOTICE_CREATE_FORM.staffScope) {
    return true
  }
  if (form.gisuMode !== INITIAL_NOTICE_CREATE_FORM.gisuMode) {
    return true
  }
  if (form.orgMode !== INITIAL_NOTICE_CREATE_FORM.orgMode) {
    return true
  }
  if (form.chapterId != null || form.schoolId != null) {
    return true
  }
  if (
    JSON.stringify(form.parts) !==
    JSON.stringify(INITIAL_NOTICE_CREATE_FORM.parts)
  ) {
    return true
  }
  if (form.mustRead !== INITIAL_NOTICE_CREATE_FORM.mustRead) {
    return true
  }
  if (form.sendNotification !== INITIAL_NOTICE_CREATE_FORM.sendNotification) {
    return true
  }
  return false
}
