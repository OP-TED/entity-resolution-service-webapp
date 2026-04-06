import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  detailPanel: {
    padding: token.paddingLG,
    overflowY: 'auto',
    height: '100%'
  },

  card: {
    overflow: 'hidden',
    height: '400px',
    border: `2px solid ${token.colorPrimary}`,

    '.ant-card-head': {
      background: palette.primaryLighter,
      paddingInline: 16,
    },

    '.ant-card-body': {
      maxHeight: '340px',
      overflowY: 'auto'
    }
  },

  candidate: {
    border: `1px solid ${token.colorBorder}`
  },

  selectedCandidate: {
    border: `2px solid ${token.colorSuccess}`
  }
}))
