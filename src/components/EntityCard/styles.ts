import { palette } from '@styles/palette'
import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  entityCard: {
    overflow: 'hidden',
    height: '400px',

    '.ant-card-body': {
      maxHeight: '340px',
      overflowY: 'auto'
    }
  },

  entityCardHeader: {
    background: palette.bgGrayLighter,
    padding: token.paddingLG,
    fontWeight: 500
  }
}))
