import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  bar: {
    position: 'sticky',
    bottom: 0,
    padding: token.paddingSM,
    background: token.colorBgContainer,
    borderTop: `1px solid ${token.colorBorder}`,
    boxShadow: `0 -2px 8px ${token.colorFillTertiary}`,
    zIndex: 10
  },

  count: {
    fontSize: token.fontSizeSM,
    color: token.colorTextSecondary,
    fontWeight: 600
  }
}))
