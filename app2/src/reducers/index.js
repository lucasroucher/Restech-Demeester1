import { combineReducers } from 'redux';

function newStudyReducer(state = {}, action) {
  switch (action.type) {
    case 'SHOW_NEW_MODAL':
      return { ...state, show: true };
    case 'HIDE_NEW_MODAL':
      return { ...state, show: false };
    case 'SAVING_NEW_STUDY':
      return { ...state, saving: true };
    case 'NEW_STUDY_SAVED':
      return { ...state, saving: false };
    default:
      return state;
  }
}

export default combineReducers({
  newStudy: newStudyReducer
});
