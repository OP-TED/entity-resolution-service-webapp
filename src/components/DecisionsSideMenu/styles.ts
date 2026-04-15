import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  decisionsSideMenu: {
    display: 'flex',
    flexDirection: 'column',
    background: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBorder}`,
    maxWidth: '300px',
    height: '100%'
  },

  header: {
    padding: token.paddingLG,
    borderBottom: `1px solid ${token.colorBorder}`,
    fontWeight: 600,
    background: token.colorWhite
  },

  selectionToolbar: {
    padding: `${token.paddingXS}px ${token.paddingSM}px`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorFillQuaternary
  },

  menuScroll: {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0
  },

  menu: {
    '&.ant-menu-light.ant-menu-root.ant-menu-inline': {
      borderInlineEnd: 'none'
    },

    '.ant-menu-item': {
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      borderLeft: '3px solid transparent',
      height: 'auto',
      lineHeight: 1.4,
      paddingTop: token.paddingSM,
      paddingBottom: token.paddingSM
    },

    '.ant-menu-item-selected': {
      borderLeft: `3px solid ${token.colorPrimary}`
    }
  }
}))
