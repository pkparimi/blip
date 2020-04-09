import React from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import MuiDialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import MuiDialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';
import styled from 'styled-components';
import { Flex } from 'rebass/styled-components';

import { Icon } from './Icon';

import {
  borders,
  radii,
  space,
  shadows,
} from '../../themes/baseTheme';

/* Dialog Title Start */
const StyledDialogTitle = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  padding: ${space[3]}px;
`;

export const DialogTitle = props => {
  const {
    children,
    closeIcon,
    onClose,
    ...dialogTitleProps
  } = props;

  return (
    <StyledDialogTitle {...dialogTitleProps}>
      {children}
      {closeIcon && (
        <Icon
          label="close dialog"
          onClick={onClose}
          icon={CloseRoundedIcon}
          variant="button"
        />
      )}
    </StyledDialogTitle>
  );
};

DialogTitle.propTypes = {
  closeIcon: PropTypes.bool,
};

DialogTitle.defaultProps = {
  closeIcon: true,
};
/* Dialog Title End */

/* Dialog Content Start */
const StyledDialogContent = styled(MuiDialogContent)`
  padding: ${space[4]}px ${space[3]}px;

  div:first-child {
    margin-top: 0;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;

export const DialogContent = props => <StyledDialogContent {...props} />;

DialogContent.propTypes = DialogContentProps;

DialogContent.defaultProps = {
  dividers: true,
};
/* Dialog Content End */

/* Dialog Actions Start */
const StyledDialogActions = styled(MuiDialogActions)`
  padding: ${space[3]}px;

  button {
    margin-left: ${space[2]}px;
  }
`;

export const DialogActions = props => <StyledDialogActions {...props} />;

DialogActions.propTypes = DialogActionsProps;

DialogActions.defaultProps = {
  disableSpacing: true,
};
/* Dialog Actions End */

/* Dialog Start */
const StyledDialog = styled(MuiDialog)`
  .MuiDialog-paper {
    border: ${borders.modal};
    box-shadow: ${shadows.large};
    border-radius: ${radii.default}px;
  }
`;

export const Dialog = props => <StyledDialog {...props} />;

Dialog.propTypes = {
  ...DialogProps,
  id: PropTypes.string.isRequired,
};
/* Dialog End */
