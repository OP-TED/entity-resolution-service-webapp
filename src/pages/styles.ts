import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  adminPage: {
    padding: token.paddingXL,
    overflowY: 'auto',
    height: '100%'
  },
  heading: {
    fontSize: token.fontSizeHeading4,
    color: token.colorText
  }
}))
