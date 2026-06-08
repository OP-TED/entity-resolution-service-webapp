import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(
  ({ token }, { alternative }: { alternative?: boolean }) => ({
    proposedCard: {
      overflow: 'hidden',
      border: alternative
        ? `2px solid ${palette.borderYellow}`
        : `2px solid ${palette.primaryLighter}`,
      height: 450,
      display: 'flex',
      flexDirection: 'column',

      '.ant-card-head': {
        background: token.colorBgContainer,
        paddingInline: 16
      },

      // Fill the remaining height below the header so no vertical space is wasted.
      '.ant-card-body': {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto'
      }
    },

    proposedCardHeader: {
      background: 'transparent',
    }
  })
)
