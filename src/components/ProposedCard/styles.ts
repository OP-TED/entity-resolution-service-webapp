import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(
  ({ token }, { alternative }: { alternative?: boolean }) => ({
    proposedCard: {
      overflow: 'hidden',
      border: alternative
        ? `2px solid ${palette.borderYellow}`
        : `2px solid ${palette.primaryLighter}`,
      height: '400px',

      '.ant-card-head': {
        background: token.colorBgContainer,
        paddingInline: 16
      },

      '.ant-card-body': {
        maxHeight: '270px',
        overflowY: 'auto'
      }
    },

    proposedCardHeader: {
      background: 'transparent',
    }
  })
)
