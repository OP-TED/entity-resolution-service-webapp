import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  header: {
    padding: token.paddingLG,
    borderBottom: `1px solid ${token.colorBorder}`,
    fontWeight: 600,
    background: token.colorWhite
  }
}))
