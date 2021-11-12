const calculateRowMaxSymbols = (maxWidth) => {
  return Math.ceil(maxWidth * 0.12)
}

export const calculateHeight = (
  text,
  maxWidth = 325,
  lineHeight = 15,
  attachmentsCount = 0,
  hasReply = false,
) => {
  // max messageItem width * 0.12
  const rowLength = calculateRowMaxSymbols(maxWidth)

  // messageItem - verticalPadding; messageContent - verticalPadding; footerHeight
  const baseHeight = 6 + 20 + 13

  let attachmentsHeight = 0
  let rowsHeight = 0

  if (attachmentsCount > 0) {
    // attachmentsContainer marginTop + (baseHeight and marginVertical of attachment) * count of attachments rows
    attachmentsHeight = 5 + (150 + 10) * Math.ceil(attachmentsCount / 2)
  }

  if (text) {
    const rowsCount = Math.ceil(text.length / rowLength)

    if (rowsCount > 1) {
      rowsHeight = rowsCount * lineHeight
    } else {
      rowsHeight = 15
    }
  }

  const embedHeight = 5 + (14 + 5) * 2

  return baseHeight + attachmentsHeight + rowsHeight + (hasReply ? embedHeight : 0)
}
