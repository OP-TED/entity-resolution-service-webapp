import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => {
  const rowBase = {
    paddingLeft: token.paddingSM,
    paddingRight: token.paddingSM
  }

  return {
    empty: {
      padding: token.padding,
      color: token.colorTextDisabled,
      fontStyle: 'italic',
      textAlign: 'center'
    },

    summaryBadge: {
      margin: 0,
      fontWeight: 600,
      fontSize: 13
    },

    list: {
      overflowY: 'auto'
    },

    row: {
      padding: `${token.paddingSM}px 0`,
      marginBottom: token.marginXS,
      borderRadius: token.borderRadiusSM,
      gap: token.marginSM,
      '&:last-child': {
        marginBottom: 0
      }
    },

    rowModified: {
      ...rowBase,
      background: token.colorWarningBg,
      borderLeft: `4px solid ${token.colorWarning}`
    },

    rowAdded: {
      ...rowBase,
      background: token.colorSuccessBg,
      borderLeft: `4px solid ${token.colorSuccess}`
    },

    rowRemoved: {
      ...rowBase,
      background: token.colorErrorBg,
      borderLeft: `4px solid ${token.colorError}`,
      opacity: 0.75
    },

    labelContainer: {
      minWidth: 160,
      maxWidth: 200,
      flexShrink: 0
    },

    // Shared value cell so the Current and Proposed panes wrap identically.
    value: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      fontWeight: 400,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      overflowWrap: 'anywhere'
    },

    diffIcon: {
      fontSize: 16,
      flexShrink: 0
    },

    diffIconModified: {
      color: token.colorWarning
    },

    diffIconAdded: {
      color: token.colorSuccess
    },

    diffIconRemoved: {
      color: token.colorError
    },

    diffIconUnchanged: {
      color: token.colorSuccess,
      opacity: 0.5
    },
    alert: {
      '& .ant-alert-title': {
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 4
      },
      '& .ant-alert-description': {
        fontSize: 14,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        fontWeight: 500
      }
    }
  }
})
