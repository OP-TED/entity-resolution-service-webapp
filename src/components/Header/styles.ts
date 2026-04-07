import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  header: {
    background: token.colorPrimaryHover,
    color: token.colorWhite,
    padding: token.paddingLG,
    paddingInline: token.paddingXL
  },
  userMenuTrigger: {
    '&&.ant-btn': {
      height: 34,
      paddingInline: 10,
      border: 0,
      borderRadius: 999,
      color: `${token.colorWhite} !important`,
      background: 'rgba(7, 24, 52, 0.35)',
      boxShadow: 'none',
      transition: 'background-color 0.2s ease'
    },
    '&&.ant-btn:hover, &&.ant-btn:focus, &&.ant-btn:active': {
      color: `${token.colorWhite} !important`,
      background: token.colorPrimary,
      border: 0,
      boxShadow: 'none'
    }
  }
}))
