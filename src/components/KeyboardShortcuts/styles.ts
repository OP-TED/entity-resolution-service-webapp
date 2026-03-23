import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  keyboardShortcuts: {
    position: 'fixed',
    bottom: token.paddingLG,
    right: token.paddingLG
  }
}))
