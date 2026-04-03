import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  entityCard: {
    overflow: 'hidden',
    height: '400px',
    border: `2px solid ${token.colorPrimary}`,

    '.ant-card-head': {
      background: palette.primaryLighter
    },

    '.ant-card-body': {
      maxHeight: '340px',
      overflowY: 'auto'
    }
  },

  entityCardHeader: {
     paddingInline: 16,
    fontWeight: 500,
    background: 'transparent'
  }
}))
