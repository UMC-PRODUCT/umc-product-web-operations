/** 열림 동안 body 스크롤 잠금, 닫을 때 scrollY 복원 */
export function lockBodyScroll(): () => void {
  const scrollY = window.scrollY
  const { style } = document.body
  const previous = {
    overflow: style.overflow,
    position: style.position,
    top: style.top,
    width: style.width,
  }

  style.overflow = "hidden"
  style.position = "fixed"
  style.top = `-${scrollY}px`
  style.width = "100%"

  return () => {
    style.overflow = previous.overflow
    style.position = previous.position
    style.top = previous.top
    style.width = previous.width
    window.scrollTo(0, scrollY)
  }
}
