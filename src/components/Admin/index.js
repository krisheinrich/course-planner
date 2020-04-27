import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { compose } from 'recompose';

import { withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import PageLayout from '../PageLayout';
import styles from './admin.module.css';

import * as ROLES from '../../constants/roles';
import * as ROUTES from '../../constants/routes';

const AdminPage = () => (
  <PageLayout>
    <h1>Admin</h1>
    <p>The Admin Page is accessible by every signed in admin user.</p>
    <Switch>
      <Route exact path={ROUTES.ADMIN_USER_DETAILS} component={UserItem} />
      <Route exact path={ROUTES.ADMIN} component={UserList} />
    </Switch>
  </PageLayout>
);

class _UserItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      user: null,
      ...props.location.state
    };
  }

  componentDidMount() {
    if (this.state.user) {
      return;
    }

    this.setState({ loading: true });

    this.props.firebase
      .user(this.props.match.params.id)
      .get()
      .then(snapshot => {
        let user = snapshot.data();
        user.uid = user.uid || this.props.match.params.id;
        this.setState({
          user: user,
          loading: false
        });
      })
      .catch(err => console.error(err));
  }

  onSendPasswordResetEmail = () => {
    this.props.firebase.resetPassword(this.state.user.email);
  };

  render() {
    const { user, loading } = this.state;

    return (
      <div>
        <h4>User ({ this.props.match.params.id })</h4>
        { loading && <div>Loading ...</div> }
        { user && (
          <ul>
            <li>
              <strong>ID:</strong> { user.uid }
            </li>
            <li>
              <strong>E-Mail:</strong> { user.email }
            </li>
            <li>
              <strong>Username:</strong> { user.username }
            </li>
            <li>
              <button type="button" onClick={this.onSendPasswordResetEmail}>
                Send Password Reset
              </button>
            </li>
          </ul>
        ) }
      </div>
    );
  }
}

class _UserList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      users: []
    };
  }

  componentDidMount() {
    this.setState({ loading: true });

    this.props.firebase.users()
      .get()
      .then(snapshot => {
        const users = [];
        snapshot.forEach(doc => {
          users.push({ uid: doc.id, ...doc.data() });
        });

        this.setState({
          loading: false,
          users
        });
      });
  }

  render() {
    const { users, loading } = this.state;

    return (
      <div>
        <h3>Users</h3>
        { loading && <div>Loading ...</div> }
        <ul>
          { users.map(user => (
            <li key={user.uid} className={`row ${styles.userItem}`}>
              <div className="col s12 m4">
                <strong>ID:</strong> { user.uid }
              </div>
              <div className="col s12 m4">
                <strong>Email:</strong> { user.email }
              </div>
              <div className="col s12 m3">
                <strong>Username:</strong> { user.username }
              </div>
              <div className="col s12 m1">
                <Link to={{ pathname: `${ROUTES.ADMIN}/users/${user.uid}`, state: { user } }}>
                  Details
                </Link>
              </div>
            </li>
          )) }
        </ul>
      </div>
    );
  }
}

const UserItem = withFirebase(_UserItem);
const UserList = withFirebase(_UserList);

const condition = authUser => authUser && !!authUser.roles[ROLES.ADMIN];

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(AdminPage);
