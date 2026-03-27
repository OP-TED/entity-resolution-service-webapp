import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  header: {
    background: token.colorPrimaryHover,
    color: token.colorWhite,
    padding: token.paddingLG,
    paddingInline: token.paddingXL
  }
}))
