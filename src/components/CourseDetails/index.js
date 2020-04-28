import React, { Component } from 'react';
import { withFirebase } from '../Firebase';
import PageLayout from '../PageLayout';

class _CourseDetails extends Component {
  state = {
    loading: false,
    error: null,
    course: null,
    sections: null
  };

  componentDidMount() {
    const { id: courseId } = this.props.match.params;
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .course(courseId)
      .onSnapshot(doc => {
        const course = { id: doc.id, ...doc.data() };

        this.setState({
          course,
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

  render() {
    const { course, loading } = this.state;
    return (
      <PageLayout>
        { loading || !course ? (
          <div>Loading...</div>
        ) : (
          <>
            <h2>{ course.name }</h2>
            <CourseTree />
          </>
        ) }
      </PageLayout>
    );
  }
}

const CourseTree = props => {
  return (
    <p>Some text</p>
  );
};

export default withFirebase(_CourseDetails);
