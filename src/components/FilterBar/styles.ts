import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  filterBar: {
    background: token.colorBgContainer,
    borderBottom: `1px solid ${token.colorBorder}`,
    padding: token.paddingLG,
    paddingInline: token.paddingXL
  }
}))
