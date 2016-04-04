/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import _ from 'lodash';
import React from 'react';
import async from 'async';
import sundial from 'sundial';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';

import * as ErrorMessages from '../../redux/constants/errorMessages';
import * as UserMessages from '../../redux/constants/usrMessages';

// Components
import Navbar from '../../components/navbar';
import LogoutOverlay from '../../components/logoutoverlay';
import BrowserWarningOverlay from '../../components/browserwarningoverlay';
import TidepoolNotification from '../../components/notification';
import MailTo from '../../components/mailto';

// Styles
require('tideline/css/tideline.less');
require('../../style.less');

// Blip favicon
require('../../../favicon.ico');

export class AppComponent extends React.Component {
  static propTypes = {
    route: React.PropTypes.shape({
      log: React.PropTypes.func.isRequired,
      api: React.PropTypes.object.isRequired,
      personUtils: React.PropTypes.object.isRequired,
      trackMetric: React.PropTypes.func.isRequired,
      DEBUG: React.PropTypes.bool.isRequired
    }).isRequired
  };

  constructor(props) {
    super(props);
  }

  hideNavbarDropdown() {
    var navbar = this.refs.navbar;

    if (navbar) {
      navbar.hideDropdown();
    }
  }

  /**
   * Only show patient name in navbar on certain pages
   *  - patients/:id/data
   *  - patients/:id/share
   *  - patients/:id/profile
   *  
   * @return {Boolean}
   */
  isPatientVisibleInNavbar() {
    return /^\/patients\/\S+/.test(this.props.location);
  }

  logSupportContact() {
    this.props.route.trackMetric('Clicked Give Feedback');
  }

  closeNotification() {
    this.props.acknowledgeNotification();
  }

  doFetching(nextProps) {
    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(fetcher => { 
      fetcher();
    });
  }

  /**
   * Before rendering for first time
   * begin fetching any required data
   */
  componentWillMount() {
    this.doFetching(this.props);
  }

  /**
   * Before any subsequent re-rendering 
   * begin fetching any required data
   */
  componentWillReceiveProps(nextProps) {
    if (!utils.isOnSamePage(this.props, nextProps)) {
      this.doFetching(nextProps);
    }
  }

  /**
   * Render Functions
   */

  renderOverlay() {
    this.props.route.log('Rendering overlay');
    if (this.props.loggingOut) {
      return (
        <LogoutOverlay ref="logoutOverlay" />
      );
    }

    if (!utils.isChrome()) {
      return (
        <BrowserWarningOverlay />
      );
    }
  }

  renderNavbar() {
    this.props.route.log('Rendering navbar');
    // at some point we should refactor so that LoginNav and NavBar
    // have a common parent that can decide what to render
    // but for now we just make sure we don't render the NavBar on a NoAuth route
    // such routes are where the LoginNav appears instead
    var LOGIN_NAV_ROUTES = [
      '/',
      '/confirm-password-reset',
      '/email-verification',
      '/login',
      '/request-password-reset',
      '/request-password-from-uploader',
      '/signup',
      '/terms'
    ];
    if (!_.includes(LOGIN_NAV_ROUTES, this.props.location)) {
      if (this.props.authenticated ||
        (this.props.fetchingUser || this.props.fetchingPatient)) {
        var patient, getUploadUrl;
        if (this.isPatientVisibleInNavbar()) {
          patient = this.props.patient;
          getUploadUrl = this.props.route.api.getUploadUrl.bind(this.props.route.api);
        }

        return (
          <div className="App-navbar">
            <Navbar
              user={this.props.user}
              fetchingUser={this.props.fetchingUser}
              patient={patient}
              fetchingPatient={this.props.fetchingPatient}
              currentPage={this.props.route.pathname}
              getUploadUrl={getUploadUrl}
              onLogout={this.props.onLogout}
              trackMetric={this.props.route.trackMetric}
              ref="navbar"/>
          </div>
        );
      }
    }

    return null;
  }

  renderNotification() {
    var notification = this.props.notification;
    var handleClose;

    if (notification) {
      this.props.route.log('Rendering notification');
      if (notification.isDismissible) {
        handleClose = this.props.onCloseNotification.bind(this);
      }

      return (
        <TidepoolNotification
          type={notification.type}
          contents={notification.body}
          link={notification.link}
          onClose={handleClose}>
        </TidepoolNotification>
      );
    }

    return null;
  }

  renderFooter() {
    var title ='Send us feedback';
    var subject = 'Feedback on Blip';

    return (
      <div className='container-small-outer footer'>
        <div className='container-small-inner'>
          <MailTo
            linkTitle={title}
            emailAddress={'support@tidepool.org'}
            emailSubject={subject}
            onLinkClicked={this.logSupportContact.bind(this)} />
        </div>
        {this.renderVersion()}
      </div>
    );
  }

  renderVersion() {
    var version = this.props.route.config.VERSION;
    if (version) {
      version = 'v' + version + ' beta';
      return (
        <div className="Navbar-version" ref="version">{version}</div>
      );
    }
    return null;
  }

  render() {
    this.props.route.log('Rendering AppComponent');
    var overlay = this.renderOverlay();
    var navbar = this.renderNavbar();
    var notification = this.renderNotification();
    var footer = this.renderFooter();

    return (
      <div className="app" onClick={this.hideNavbarDropdown.bind(this)}>
        {overlay}
        {navbar}
        {notification}
        {this.props.children}
        {footer}
      </div>
    );
  }
}

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchUser.bind(null, api)
  ];
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  let user = null;
  let patient = null;

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.currentPatientInViewId) {
      patient = state.blip.allUsersMap[state.blip.currentPatientInViewId];
      if (state.blip.targetUserId && state.blip.currentPatientInViewId === state.blip.targetUserId) {
        const permsOfTargetOnTarget = _.get(
          state.blip.permissionsOfMembersInTargetCareTeam,
          state.blip.currentPatientInViewId,
          null
        );
        if (permsOfTargetOnTarget) {
          patient.permissions = permsOfTargetOnTarget;
        }
      }
    }
  }

  let displayNotification = null;

  if (state.blip.notification !== null) {
    const utcTime = UserMessages.MSG_UTC + new Date().toISOString();
    const notificationFromWorking = _.get(
      state.blip.working[_.get(state.blip.notification, 'key')],
      'notification'
    );
    let displayMessage = _.get(
      notificationFromWorking, 'message', ErrorMessages.ERR_GENERIC
    );

    const status = _.get(state.blip.notification, 'status');
    if (status !== null) {
      switch (status) {
        case 401:
          if (state.blip.isLoggedIn) {
            displayMessage = ErrorMessages.ERR_AUTHORIZATION;
          } else {
            displayMessage = null;
          }
          break;
        case 500:
          displayMessage = ErrorMessages.ERR_SERVICE_DOWN;
          break;
        case 503: 
          displayMessage = ErrorMessages.ERR_OFFLINE;
          break;
      }
    }
    if (displayMessage) {
      displayNotification = _.assign(
        _.omit(state.blip.notification, 'key'),
        {
          type: _.get(notificationFromWorking, 'type'),
          body: { message: displayMessage, utc: utcTime }
        }
      );
    } else {
      displayNotification = null;
    }
  }

  return {
    authenticated: state.blip.isLoggedIn,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    loggingOut: state.blip.working.loggingOut.inProgress,
    notification: displayNotification,
    termsAccepted: _.get(user, 'termsAccepted', null),
    user: user,
    patient: patient
  };

};

let mapDispatchToProps = dispatch => bindActionCreators({
  fetchUser: actions.async.fetchUser,
  acceptTerms: actions.async.acceptTerms,
  logout: actions.async.logout,
  onCloseNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    fetchUser: dispatchProps.fetchUser.bind(null, api),
    location: ownProps.location.pathname,
    onLogout: dispatchProps.logout.bind(null, api),
    onAcceptTerms: dispatchProps.acceptTerms.bind(null, api),
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(AppComponent);
