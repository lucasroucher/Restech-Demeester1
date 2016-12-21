export default function(state = {}, action) {
  switch (action.type) {
    case 'SHOW_NEW_MODAL':
      return { ...state, newModalShowing: true };
    case 'HIDE_NEW_MODAL':
      return { ...state, newModalShowing: false };
    default:
      return state;
  }
}
