export default ({ colors, borders }) => ({
  primary: {
    backgroundColor: colors.purpleMedium,
    border: borders.input,
    borderColor: colors.purpleMedium,
    color: colors.white,
    '&:hover,&:active': {
      backgroundColor: colors.text.primary,
      borderColor: colors.text.primary,
    },
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  },
  secondary: {
    bg: colors.white,
    color: colors.text.primary,
    border: borders.input,
    '&:hover,&:active': {
      color: colors.white,
      backgroundColor: colors.text.primary,
      borderColor: colors.text.primary,
    },
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  },
  icon: {
    bg: colors.white,
    color: colors.text.primary,
    border: borders.input,
    '&:hover,&:active': {
      color: colors.white,
      backgroundColor: colors.text.primary,
      borderColor: colors.text.primary,
    },
    '&:disabled': {
      backgroundColor: colors.lightestGrey,
      borderColor: colors.lightestGrey,
      color: colors.text.primaryDisabled,
    },
  },
});
