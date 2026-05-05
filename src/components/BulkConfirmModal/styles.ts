import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  list: {
    maxHeight: 360,
    overflowY: 'auto',
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius
  },

  row: {
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    '&:last-child': {
      borderBottom: 'none'
    }
  },

  arrow: {
    flexShrink: 0,
    opacity: 0.45,
    fontSize: 11
  },

  tags: {
    flexShrink: 0
  },

  footnote: {
    marginTop: token.marginMD,
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM
  }
}))
