export function getTourBadgeDetails(tour, lowSlotsThreshold = 3) {
  // 1. Fallback to older data if available_slots is undefined (backward compatibility)
  if (tour.available_slots === undefined || tour.available_slots === null) {
    // Some tours might still rely on the old text logic
    const oldText = tour.badge || 'OPEN'
    const isLast = tour.badge_variant === 'last'

    if (isLast) {
      return {
        canBook: true,
        text: 'LAST SLOT',
        badgeClass:
          'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-error-container/50 bg-error/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-white uppercase shadow-sm',
        dotClass: 'h-2 w-2 animate-ping rounded-full bg-white',
      }
    }
    
    // Attempt parsing numbers from old text if it says "slots left"
    if (oldText.toLowerCase().includes('slots left')) {
      const parsedSlots = parseInt(oldText, 10)
      if (!isNaN(parsedSlots)) {
        if (parsedSlots <= 0) {
           return _soldOutBadge();
        } else if (parsedSlots <= lowSlotsThreshold) {
           return _urgentBadge(parsedSlots);
        } else {
           return _normalBadge(parsedSlots);
        }
      }
    }

    return {
      canBook: true,
      text: oldText,
      badgeClass:
        'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-blue-700 uppercase shadow-sm',
      dotClass: 'h-2 w-2 rounded-full bg-blue-400',
    }
  }

  // 2. Strict calculation using integer available_slots
  const slots = tour.available_slots

  if (slots <= 0) {
    return _soldOutBadge();
  }

  if (slots <= lowSlotsThreshold) {
    if (slots === 1) {
      return {
        canBook: true,
        text: 'LAST SLOT',
        badgeClass:
          'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-error-container/50 bg-error/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-white uppercase shadow-sm',
        dotClass: 'h-2 w-2 animate-ping rounded-full bg-white',
      }
    }
    return _urgentBadge(slots);
  }

  return _normalBadge(slots);
}

function _soldOutBadge() {
  return {
    canBook: false,
    text: 'SOLD OUT',
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-error-container/50 bg-error/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-white uppercase shadow-sm opacity-80 grayscale',
    dotClass: 'h-2 w-2 rounded-full bg-white',
  }
}

function _urgentBadge(slots) {
  return {
    canBook: true,
    text: `${slots} SLOTS LEFT`,
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-tertiary uppercase shadow-sm',
    dotClass: 'h-2 w-2 animate-pulse rounded-full bg-tertiary',
  }
}

function _normalBadge(slots) {
  return {
    canBook: true,
    text: `${slots} SLOTS LEFT`,
    badgeClass:
      'pill-badge absolute top-5 left-5 flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2 font-label text-[11px] font-extrabold tracking-[0.1em] text-blue-700 uppercase shadow-sm',
    dotClass: 'h-2 w-2 rounded-full bg-blue-400',
  }
}
