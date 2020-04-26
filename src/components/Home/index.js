import React, { Component } from 'react';
import { compose } from 'recompose';

import { AuthUserContext, withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import PageLayout from '../PageLayout';

const Home = () => (
  <PageLayout>
    <h1>My Courses</h1>
    <AuthUserContext.Consumer>
      { authUser => (
        <CourseList user={authUser} />
      ) }
    </AuthUserContext.Consumer>
  </PageLayout>
);

class _CourseList extends Component {
  state = {
    loading: false,
    courses: null,
    error: null
  };

  componentDidMount() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .userCourses(this.props.user.uid)
      .onSnapshot(snapshot => {
        const courses = [];
        snapshot.forEach(doc => {
          courses.push({ id: doc.id, ...doc.data() });
        });

        this.setState({
          courses,
          loading: false,
          error: null
        });
      }, err => {
        console.error(err);
        this.setState({
          loading: false,
          error: err.code
        });
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const { courses, loading, error } = this.state;
    return error ? (
      <div className="red-text text-darken-3">Error: { error }</div>
    ) : !courses || loading ? (
      <div>Loading courses...</div>
    ) : !courses.length ? (
      <div>You have no courses. Create a first course to begin.</div>
    ) : (
      <div className="row">
        { courses.map(({ id, name, description }) => (
          <div key={id} className="col s12 m6 l4">
            <div className="card blue-grey darken-1">
              <div className="card-content white-text">
                <span className="card-title">{ name }</span>
                <p>{ description }</p>
              </div>
              <div className="card-action">
                <a href="#">Go to Course</a>
              </div>
            </div>
          </div>
        )) }
      </div>
    );
  }
}

const CourseList = withFirebase(_CourseList);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition),
)(Home);
