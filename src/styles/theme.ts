import { palette } from './palette'

export const antdTheme = {
  token: {
    // Colors
    colorPrimary: palette.primary,
    colorPrimaryHover: palette.primaryHover,
    colorPrimaryActive: palette.primaryDark,
    colorError: palette.errorLight,
    colorSuccess: palette.successLight,
    colorWarning: palette.warning,
    colorText: palette.textBlack,
    colorTextSecondary: palette.textTertiary,
    colorTextDisabled: palette.textDisabled,
    colorBorder: palette.borderGray,
    colorBorderSecondary: palette.borderGrayLight,
    colorBgContainer: palette.bgWhite,
    colorBgElevated: palette.bgWhite,
    colorBgLayout: palette.bgGrayLight,
    colorFillSecondary: palette.bgGrayLight,
    colorFillTertiary: palette.bgGrayLightest,

    // Border Radius
    borderRadius: 6,
    borderRadiusSM: 4,
    borderRadiusLG: 12,

    // Font
    fontSize: 14,
    fontSizeSM: 13,
    fontSizeLG: 18,
    lineHeight: 1.6,

    // Control Height
    controlHeight: 32,
    controlHeightSM: 28,
    controlHeightLG: 40,

    // Padding
    padding: 16,
    paddingSM: 8,
    paddingMD: 12,
    paddingLG: 16,
    paddingXS: 4,
    paddingXXS: 2,

    // Focus
    controlOutline: palette.focusBlue,
    controlOutlineWidth: 2
  },
  components: {
    Typography: {
      titleMarginBottom: '0',
      fontSizeHeading1: 24,
      colorTextHeading: 'white'
    },

    Menu: {
      itemHeight: 80,
      itemMarginBlock: 0,
      itemMarginInline: 0,
      borderRadius: 0,
      borderRadiusLG: 0,
      padding: 8,
      paddingXL: 8,
      paddingXS: 8
    },

    Tag: {
      borderRadiusSM: 12,
      colorText: 'white',
      fontSize: 13,
      fontSizeSM: 13
    },

    Card: {
      bodyPadding: 16,
      headerPadding: 0,
      borderRadiusLG: 6
    },

    Alert: {
      borderRadiusLG: 6
    },

    Collapse: {
      borderRadiusLG: 6
    },

    Divider: {
      margin: 8,
      marginLG: 8,
      marginXS: 8
    }
  }
}
