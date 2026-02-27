import gsap from "gsap"

export function staggerFadeIn(
  elements: string | Element | Element[],
  options?: { delay?: number; stagger?: number; y?: number }
) {
  return gsap.fromTo(
    elements,
    { opacity: 0, y: options?.y ?? 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: options?.stagger ?? 0.1,
      delay: options?.delay ?? 0,
      ease: "power2.out",
    }
  )
}

export function slideIn(
  element: string | Element,
  direction: "right" | "left" | "up" | "down" = "right"
) {
  const from: Record<string, number> = { opacity: 0 }
  if (direction === "right") from.x = 40
  if (direction === "left") from.x = -40
  if (direction === "up") from.y = -40
  if (direction === "down") from.y = 40

  return gsap.fromTo(element, from, {
    opacity: 1,
    x: 0,
    y: 0,
    duration: 0.4,
    ease: "power2.out",
  })
}

export function scaleIn(element: string | Element) {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.9 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    }
  )
}

export function slidePanel(element: string | Element, open: boolean) {
  if (open) {
    return gsap.fromTo(
      element,
      { height: 0, opacity: 0, overflow: "hidden" },
      { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
    )
  } else {
    return gsap.to(element, {
      height: 0,
      opacity: 0,
      duration: 0.25,
      ease: "power2.in",
      overflow: "hidden",
    })
  }
}
