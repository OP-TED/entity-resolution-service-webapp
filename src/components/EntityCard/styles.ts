import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  entityCard: {
    overflow: 'hidden',
    height: '450px',
    display: 'flex',
    flexDirection: 'column',
    border: `2px solid ${token.colorPrimary}`,

    '.ant-card-head': {
      background: palette.primaryLighter
    },

    // Fill the remaining height below the header so both panes match.
    '.ant-card-body': {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto'
    }
  },

  entityCardHeader: {
     paddingInline: 16,
    fontWeight: 500,
    background: 'transparent'
  }
}))
