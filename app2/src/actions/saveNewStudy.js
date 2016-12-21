export default function saveNewStudy() {
  return (dispatch) => {
    dispatch({
      type: 'SAVING_NEW_STUDY',
    });

    dispatch({
      type: 'NEW_STUDY_SAVED',
    });

    dispatch({
      type: 'HIDE_NEW_MODAL',
    });

    // dispatch({
    //   type: 'NEW_STUDY_SAVE_FAILED'
    // });
  };
}
