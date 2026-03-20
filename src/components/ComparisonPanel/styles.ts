import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  comparisonPanel: {
    padding: token.paddingLG,
    overflowY: 'auto',
    height: '100%'
  }
}))
