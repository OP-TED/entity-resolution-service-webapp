import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(
  ({ token }, { alternative }: { alternative?: boolean }) => ({
    proposedCard: {
      overflow: 'hidden',
      border: alternative
        ? `2px solid ${palette.borderYellow}`
        : `2px solid ${token.colorPrimary}`,
      height: '400px',

      '.ant-card-body': {
        maxHeight: '270px',
        overflowY: 'auto'
      }
    },

    proposedCardHeader: {
      background: alternative ? palette.bgYellowLight : palette.primaryLighter,
      padding: token.paddingLG
    }
  })
)
