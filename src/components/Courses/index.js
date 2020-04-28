import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import M from 'materialize-css';

import { AuthUserContext, withAuthorization, withEmailVerification } from '../Session';
import { withFirebase } from '../Firebase';
import PageLayout from '../PageLayout';
import Modal from '../Modal';
import styles from './courses.module.css';

const Courses = () => {
  return (
    <AuthUserContext.Consumer>
      { authUser => (
        <PageLayout>
          <div className={styles.header}>
            <h1>My Courses</h1>
            <a href="#course-modal" className={`btn-floating btn-large waves-effect waves-light red modal-trigger ${styles.button}`}>
              <i className="large material-icons">add</i>
            </a>
          </div>
          <AddCourseModal modalId="course-modal" userId={authUser.uid} />
          <CourseList userId={authUser.uid} />
        </PageLayout>
      ) }
    </AuthUserContext.Consumer>
  );
};


class _AddCourseModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newCourseName: '',
      newCourseDesc: '',
      error: ''
    };

    this.modal = React.createRef();
  }

  componentDidMount() {
    M.Modal.init(this.modal.current);
  }

  setCourseName = e => {
    this.setState({ newCourseName: e.target.value });
  }

  setCourseDesc = e => {
    this.setState({ newCourseDesc: e.target.value });
  }

  saveCourse = async () => {
    const { userId } = this.props;
    const { newCourseName, newCourseDesc } = this.state;

    if (!newCourseName || !newCourseDesc) {
      this.setState({ error: 'You must enter a name and description '});
      return;
    }

    const course = {
      name: newCourseName,
      description: newCourseDesc,
      userId
    };

    try {
      await this.props.firebase.createCourse(course);      
      this.resetModal();
    } catch (err) {
      console.error(err);
      this.setState({ error: err.message });
    }
  }

  resetModal = () => {
    this.setState({ newCourseName: '', newCourseDesc: '', error: '' });
    M.Modal.getInstance(this.modal.current).close();
  }

  render() {
    const { modalId = '' } = this.props;
    const { newCourseName, newCourseDesc, error } = this.state;
    return (
      <Modal ref={this.modal} id={modalId}>
        <div className="modal-content">
          <h4>Add New Course</h4>
          <form>
            <div className="input-field">
              <input type="text" id="title" value={newCourseName} onChange={this.setCourseName} />
              <label htmlFor="title">Course Name</label>
            </div>
            <div className="input-field">
              <textarea id="textarea" className="materialize-textarea" value={newCourseDesc}
                onChange={this.setCourseDesc}/>
              <label htmlFor="textarea">Description</label>
            </div>
            { error && <div>{ error }</div> }
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn-flat waves-effect waves-green" onClick={this.resetModal}>
            Cancel
          </button>
          <button type="submit" className="btn waves-effect waves-light red" onClick={this.saveCourse}>
            Add Course
            <i className="material-icons right">add</i>
          </button>
        </div>
      </Modal>
    );
  }
}


class _CourseList extends Component {
  state = {
    loading: false,
    courses: null,
    error: null
  };

  componentDidMount() {
    const { userId } = this.props;
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .userCourses(userId)
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
        { courses.map(({ id: courseId, name, description }) => (
          <div key={courseId} className="col s12 m6 l4">
            <div className="card small blue-grey darken-1">
              <div className="card-content white-text">
                <span className="card-title">{ name }</span>
                <p>{ description }</p>
              </div>
              <div className="card-action">
                <Link to={{ pathname: `/courses/${courseId}` }}>
                  Go to Course
                </Link>
              </div>
            </div>
          </div>
        )) }
      </div>
    );
  }
}

const AddCourseModal = withFirebase(_AddCourseModal);

const CourseList = withFirebase(_CourseList);

const condition = authUser => !!authUser;

export default compose(
  withEmailVerification,
  withAuthorization(condition)
)(Courses);
